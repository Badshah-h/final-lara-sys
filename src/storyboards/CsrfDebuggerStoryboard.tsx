import CsrfDebugger from "@/components/debug/CsrfDebugger";

export default function CsrfDebuggerStoryboard() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CSRF Token Debugging</h1>
        <CsrfDebugger />
      </div>
    </div>
  );
}
