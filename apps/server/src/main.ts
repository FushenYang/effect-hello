import { Effect, Layer, Ref } from "effect";
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

// 启动在 3000 端口，配置 CORS 允许前端跨域
const ServerLive = NodeHttpServer.layer(() => createServer(), { port: 3000 });
// 【注意】如果你不用平台库提供的中间件，你可以自己加简单的 CORS 处理，目前我们先保持最简

// const HttpLive = HttpApiBuilder.serve(ApiLive).pipe(
//   Layer.provide(PostsApiLive),
//   Layer.provide(ServerLive),
//   Layer.provide(DbLive) // 提供数据库依赖
// )
const AppLive = HttpApiBuilder.serve().pipe(
  // serve() 返回一个特殊的 Layer，它大喊：“我需要一个 Api 实现，和一个 Server 引擎！”
  // 满足第一个需求：提供 API 实现 (此时它知道要去哪里找路由了)
  Layer.provide(ApiLive),
  // 满足 API 实现内部的需求：提供数据库
  Layer.provide(DbLive),
  // 满足 serve() 的第二个需求：提供底层 HTTP Server 引擎
  Layer.provide(ServerLive),
);

// 运行程序
NodeRuntime.runMain(Layer.launch(AppLive));
