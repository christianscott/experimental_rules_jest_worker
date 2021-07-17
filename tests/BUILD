load("//tools/jest:jest.bzl", "jest_test")

jest_test(
    name = "test",
    srcs = [
        "one.ts",
        "one.test.ts",
        "two.test.ts",
    ] + glob(
        ["__snapshots__/*"],
        allow_empty = True,
    ),
)
