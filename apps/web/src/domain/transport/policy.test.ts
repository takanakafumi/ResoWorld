import { describe, expect, it } from "vitest";

import { DataTransportPolicySchema } from "./policy";

describe("DataTransportPolicySchema", () => {
  it("allows a server workflow to receive the full exploration dataset", () => {
    const policy = DataTransportPolicySchema.parse({
      storage: "hybrid",
      analysis: "server",
      contextScope: "full-dataset",
      providerIds: ["resoworld-sync", "server-analysis"],
    });

    expect(policy.contextScope).toBe("full-dataset");
    expect(policy.analysis).toBe("server");
  });

  it("also keeps a fully local workflow available", () => {
    expect(
      DataTransportPolicySchema.parse({
        storage: "local",
        analysis: "local",
        contextScope: "minimum-brief",
      }).providerIds,
    ).toEqual([]);
  });
});
