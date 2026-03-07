import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

// ==========================================
// 1. 定义实体 (DDD 领域驱动设计)
// ==========================================
export class Post extends Schema.Class<Post>("Post")({
  id: Schema.Number,
  title: Schema.String.pipe(Schema.nonEmptyString()),
  content: Schema.String,
  keyword: Schema.String, // 可选的标签数组，默认为空
}) {}

// 创建文章的请求载荷 (不需要 id)
export class CreatePostRequest extends Schema.Class<CreatePostRequest>(
  "CreatePostRequest",
)({
  title: Schema.String.pipe(Schema.minLength(3)),
  content: Schema.String,
  keyword: Schema.String,
}) {}

// ==========================================
// 2. 定义 API 契约 (Endpoint & Group)
// ==========================================
const postsGroup = HttpApiGroup.make("posts")
  // GET /posts -> 返回 Post 数组
  .add(HttpApiEndpoint.get("getPosts", "/posts").addSuccess(Schema.Array(Post)))
  // POST /posts -> 接收 CreatePostRequest，返回创建好的 Post
  .add(
    HttpApiEndpoint.post("createPost", "/posts")
      .setPayload(CreatePostRequest)
      .addSuccess(Post),
  );

// 3. 组合成整个 App 的 API
export const AppApi = HttpApi.make("app").add(postsGroup).prefix("/api");
