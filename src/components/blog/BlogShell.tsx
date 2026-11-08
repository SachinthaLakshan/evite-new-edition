import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BlogShellProps = {
  children: React.ReactNode;
};

export function BlogShell({ children }: BlogShellProps) {
  return (
    <div className="min-h-screen bg-[#fbf6ef] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="eVite Logo"
              width={96}
              height={96}
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <Link href="/blog" className="text-[#9a6b32]">
              Blog
            </Link>
            <Link href="/#pricing" className="hover:text-[#c4782a] transition-colors">
              Pricing
            </Link>
            <Link href="/samples/lavender" className="hover:text-[#c4782a] transition-colors">
              Samples
            </Link>
          </nav>
          <Link href="/auth?mode=signup">
            <Button className="rounded-full bg-[#ff7a3d] hover:bg-[#f0682c] text-sm font-semibold">
              Create your invite
            </Button>
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} eVite.lk. Wedding guides & digital invites.</p>
          <div className="flex gap-4">
            <Link href="/" className="font-semibold hover:text-slate-900">
              Home
            </Link>
            <Link href="/privacy-policy" className="font-semibold hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="font-semibold hover:text-slate-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
