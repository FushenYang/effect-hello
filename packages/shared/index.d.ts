import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
declare const Post_base: Schema.Class<Post, {
    id: typeof Schema.Number;
    title: Schema.filter<typeof Schema.String>;
    content: typeof Schema.String;
    keyword: typeof Schema.String;
}, Schema.Struct.Encoded<{
    id: typeof Schema.Number;
    title: Schema.filter<typeof Schema.String>;
    content: typeof Schema.String;
    keyword: typeof Schema.String;
}>, never, {
    readonly id: number;
} & {
    readonly content: string;
} & {
    readonly keyword: string;
} & {
    readonly title: string;
}, {}, {}>;
export declare class Post extends Post_base {
}
declare const CreatePostRequest_base: Schema.Class<CreatePostRequest, {
    title: Schema.filter<typeof Schema.String>;
    content: typeof Schema.String;
    keyword: typeof Schema.String;
}, Schema.Struct.Encoded<{
    title: Schema.filter<typeof Schema.String>;
    content: typeof Schema.String;
    keyword: typeof Schema.String;
}>, never, {
    readonly content: string;
} & {
    readonly keyword: string;
} & {
    readonly title: string;
}, {}, {}>;
export declare class CreatePostRequest extends CreatePostRequest_base {
}
export declare const AppApi: HttpApi.HttpApi<"app", HttpApiGroup.HttpApiGroup<"posts", HttpApiEndpoint.HttpApiEndpoint<"getPosts", "GET", never, never, never, never, readonly Post[], never, never, never> | HttpApiEndpoint.HttpApiEndpoint<"createPost", "POST", never, never, CreatePostRequest, never, Post, never, never, never>, never, never, false>, import("@effect/platform/HttpApiError").HttpApiDecodeError, never>;
export {};
