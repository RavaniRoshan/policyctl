import { fetchCurrentUser } from "../hosted.js";
import { c, panel } from "../ui.js";

export interface WhoamiOptions {
  server?: string;
}

export async function whoamiCommand(opts: WhoamiOptions): Promise<void> {
  const user = await fetchCurrentUser(opts.server);
  if (!user) {
    console.log(
      panel("policyctl whoami", [
        `  ${c.warn("▲")} ${c.muted("Not authenticated")}`,
        "",
        c.muted("Run `policyctl login` to authenticate."),
      ]),
    );
    process.exit(4);
    return;
  }

  console.log(
    panel("policyctl whoami", [
      `  ${c.success("✓")} ${c.primary(user.email)}`,
      `  ${c.muted("id")} ${user.id}`,
    ]),
  );
}
