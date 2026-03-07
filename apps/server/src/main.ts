import { Effect, Layer, Ref, Config } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";
import { AppApi, Post } from "@effect-hello/shared";

// ==========================================
// 1. 模拟数据库 (使用 Effect.Ref 提供并发安全的状态)
// ==========================================
const makeDb = Effect.gen(function* () {
  const posts = yield* Ref.make<Post[]>([
    new Post({
      id: 1,
      title: "Hello World",
      content: "This is the first post.",
      keyword: "greeting",
    }),
  ]);
  let idCounter = 1;

  return {
    getPosts: Ref.get(posts),
    createPost: (req: { title: string; content: string; keyword: string }) =>
      Effect.gen(function* () {
        // 使用 Schema.Class 实例化，自带强校验！
        const post = new Post({ id: idCounter++, ...req });
        yield* Ref.update(posts, (arr) => [...arr, post]);
        return post;
      }),
  };
});

// 定义依赖注入的 Tag 和 Layer
class Db extends Effect.Tag("Db")<Db, Effect.Effect.Success<typeof makeDb>>() {}
const DbLive = Layer.effect(Db, makeDb);

// ==========================================
// 2. 实现 API 契约
// ==========================================
const PostsApiLive = HttpApiBuilder.group(AppApi, "posts", (handlers) =>
  handlers
    .handle("getPosts", () =>
      Effect.gen(function* () {
        const db = yield* Db; // 注入数据库
        return yield* db.getPosts;
      }),
    )
    .handle("createPost", ({ payload }) =>
      Effect.gen(function* () {
        const db = yield* Db;
        return yield* db.createPost(payload);
      }),
    ),
);

const ApiLive = HttpApiBuilder.api(AppApi).pipe(Layer.provide(PostsApiLive));

// ==========================================
// 读取一个端口配置
const portConfig = Config.integer("PORT").pipe(Config.withDefault(3000));
// 启动在 3000 端口，配置 CORS 允许前端跨域
const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    // 1. 读取配置（获取端口号）
    const port = yield* portConfig;
    // 2. 打印一条启动日志，让你清楚地知道它在哪运行
    yield* Effect.logInfo(`Starting HTTP Server on port ${port}...`);
    // 3. 返回配置好的 Layer！
    // (unwrapEffect 会自动把这个返回的 Layer 挂载到系统中)
    const ret = NodeHttpServer.layer(createServer, { port });
    return ret;
  }),
);

const HttpLive = HttpApiBuilder.serve();
const AppLive = HttpLive.pipe(
  (layer) => {
    return layer;
  },
  Layer.provide(ApiLive),
  Layer.provide(DbLive),
  Layer.provide(ServerLive),
);

// 运行程序
NodeRuntime.runMain(Layer.launch(AppLive));
