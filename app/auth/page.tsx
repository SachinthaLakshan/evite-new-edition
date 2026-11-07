import Auth from "@/legacy-pages/Auth";

type SearchParams = {
  mode?: string | string[];
  plan?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Auth
      initialMode={firstParam(searchParams.mode)}
      initialPlan={firstParam(searchParams.plan)}
    />
  );
}
