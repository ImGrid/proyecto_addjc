export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sistema ADDJC</h1>
        <p className="mt-2 text-gray-600">
          Gestion y Planificacion de Entrenamiento
        </p>
      </div>
      {children}
    </div>
  );
}
