workspace(
    name = "experimental_rules_jest_worker",
    managed_directories = {"@npm": ["node_modules"]},
)

load("//tools:bazel_deps.bzl", "fetch_dependencies")

fetch_dependencies()

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)
