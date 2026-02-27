import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <div className="page-content flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-3xl flex-col items-center justify-center py-32 px-16 text-center">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
            Welcome to Econiya
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Digital Platforms Pvt. Ltd. — Your technology partner for innovative solutions.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="/about"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              About Us
            </a>
            <a
              href="/contact"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Contact
            </a>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
