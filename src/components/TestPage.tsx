import ShadowStableQr from "./ShadowStableQr";

export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QR Code Test</h1>
      <StableQr value="https://example.com" size={256} />
    </div>
  );
}
