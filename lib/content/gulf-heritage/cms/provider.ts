import { staticGulfHeritageCmsRepositories } from "@/lib/content/gulf-heritage/cms/repositories/static";
import { GulfHeritageContentService } from "@/lib/content/gulf-heritage/cms/services/gulf-heritage-content.service";
import type { GulfHeritageCmsRepositories } from "@/lib/content/gulf-heritage/cms/repositories/types";

const defaultGulfHeritageContentService = new GulfHeritageContentService(staticGulfHeritageCmsRepositories);

export function getGulfHeritageCmsRepositories(): GulfHeritageCmsRepositories {
  return staticGulfHeritageCmsRepositories;
}

export function getGulfHeritageContentService(
  repositories: GulfHeritageCmsRepositories = staticGulfHeritageCmsRepositories,
): GulfHeritageContentService {
  if (repositories === staticGulfHeritageCmsRepositories) {
    return defaultGulfHeritageContentService;
  }
  return new GulfHeritageContentService(repositories);
}

export { GulfHeritageContentService };
