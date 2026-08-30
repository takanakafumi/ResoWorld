import { z } from "zod";

import { KnowledgeDatasetSchema } from "./schema";

export const KnowledgeDatasetJsonSchema = z.toJSONSchema(
  KnowledgeDatasetSchema,
  {
    target: "draft-2020-12",
  },
);
