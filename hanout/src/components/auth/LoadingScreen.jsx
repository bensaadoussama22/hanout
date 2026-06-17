export default function LoadingScreen() {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center">
      <div
        className="w-12 h-12 rounded-full animate-spin"
        style={{
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)',
        }}
      />
    </div>
  );
}
