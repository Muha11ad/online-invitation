import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const resolvedSearchParams = await searchParams;
  const expired = firstValue(resolvedSearchParams.expired) === "1";
  const redirectTo = firstValue(resolvedSearchParams.redirect);

  return <LoginForm expired={expired} redirectTo={redirectTo} />;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface PageProps {
  searchParams: Promise<{ expired?: string | string[]; redirect?: string | string[] }>;
}
