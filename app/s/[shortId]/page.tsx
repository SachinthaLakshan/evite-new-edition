import type { Metadata } from "next";
import ShortUrlRedirect from "@/legacy-pages/ShortUrlRedirect";
import {
  lavenderShareMetadata,
  resolveInviteShareByShortId,
} from "@/lib/seo/invite-share";

export const dynamic = "force-dynamic";

type ShortLinkPageProps = {
  params: { shortId: string };
};

export async function generateMetadata({
  params,
}: ShortLinkPageProps): Promise<Metadata> {
  const share = await resolveInviteShareByShortId(params.shortId);
  if (!share?.isLavender) return {};

  return lavenderShareMetadata(
    share.title,
    share.description,
    `/s/${params.shortId}`,
  );
}

export default function ShortLinkPage() {
  return <ShortUrlRedirect />;
}
