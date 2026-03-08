import { For } from "solid-js";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/solid-query";
import { HttpApiClient, FetchHttpClient } from "@effect/platform";
import { AppApi } from "@effect-hello/shared";
import { Effect } from "effect";

// ==========================================
// 2. 配置 Effect 运行环境 (底层用浏览器的 fetch)
// ==========================================
// 这里我们提供 FetchHttpClient 的环境，并因为目前没有写 Vite proxy，
// 我们最简单的方法是在请求前手动拼上本地后端的 URL。
const fetchPostsEffect = Effect.gen(function* () {
  const t = HttpApiClient.make(AppApi);
  const client = yield* t;
  // 调用契约上的方法
  const response = yield* client.posts.getPosts();
  return response;
}).pipe(
  // 提供浏览器的 Fetch 环境让 HttpApiClient 可以真正发请求
  Effect.provide(FetchHttpClient.layer),
);

// ==========================================
// 3. 定义 Solid 组件
// ==========================================
const queryClient = new QueryClient();

function PostsList() {
  // TanStack Query 的 v5 标准语法
  const query = useQuery(() => ({
    queryKey: ["posts"],
    // 在边界处，将 Effect 转换为 Promise 交给 TanStack
    queryFn: () => {
      const t = Effect.runPromise(fetchPostsEffect);
      return t;
    },
  }));

  return (
    <div style={{ padding: "20px", "font-family": "sans-serif" }}>
      <h1>My Effect Posts</h1>

      {/* 处理加载状态 */}
      {query.isLoading && <p>Loading data from server...</p>}

      {/* 处理错误状态 */}
      {query.isError && <p style={{ color: "red" }}>Error loading posts!</p>}

      {/* 渲染数据 */}
      {query.isSuccess && (
        <ul>
          <For each={query.data}>
            {(post) => (
              <li style={{ "margin-bottom": "10px" }}>
                <strong>
                  [{post.id}] {post.title}
                </strong>
                <p style={{ margin: "4px 0", color: "#666" }}>{post.content}</p>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostsList />
    </QueryClientProvider>
  );
}
