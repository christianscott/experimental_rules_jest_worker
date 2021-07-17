load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

exports_files(["reporter.js"])

nodejs_binary(
    name = "runner",
    data = [
        "@npm//jest",
        "@npm//jest-config",
        "@npm//jest-message-util",
        "@npm//jest-runtime",
        "@npm//@bazel/worker",
        "@npm//@jest/reporters"
    ],
    entry_point = ":runner.js",
    visibility = ["//visibility:public"],
)
