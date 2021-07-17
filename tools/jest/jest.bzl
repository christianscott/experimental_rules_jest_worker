"""
Runs a custom jest runner that can operate as a worker.
"""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")

def _create_jest_test_results_impl(ctx):
    tests = [src for src in ctx.files.srcs if src.path.endswith(".test.ts")]

    args = ctx.actions.args()

    args.use_param_file("@%s", use_always = True)
    args.set_param_file_format("multiline")
    args.add(ctx.outputs.results.path)
    args.add_all(tests)

    ctx.actions.run(
        arguments = [args],
        executable = ctx.executable.tool,
        inputs = ctx.files.srcs,
        outputs = [ctx.outputs.results],
        execution_requirements = {"supports-workers": "1"},
        mnemonic = "JestTest",
        progress_message = "Running Jest on {}".format(ctx.label),
    )

_create_jest_test_results = rule(
    implementation = _create_jest_test_results_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "tool": attr.label(
            default = Label("//tools/jest:runner"),
            executable = True,
            cfg = "host",
        ),
        "results": attr.output(mandatory = True),
    },
)

def jest_test(name, srcs):
    _create_jest_test_results(
        name = name + "_results",
        srcs = srcs,
        results = "results.json"
    )
    nodejs_test(
        name = name,
        entry_point = "//tools/jest:reporter.js",
        templated_args = ["$(rootpath :results.json)"],
        data = [":results.json"],
        size = "small"
    )
