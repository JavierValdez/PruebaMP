import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthTests } from '../../hooks/useAuthTests';

const AuthTestComponent: React.FC = () => {
  const { state } = useAuth();
  const { 
    results, 
    loading, 
    runCompleteTests, 
    runErrorTests, 
    clearResults,
    runHealthCheck,
    runRegistrationTest,
    runLoginTest,
    runTokenVerificationTest,
    runProfileTest,
    runRefreshTokenTest
  } = useAuthTests();

  const runIndividualTests = async () => {
    clearResults();
    
    // Ejecutar pruebas individuales para demostración
    await runHealthCheck();
    await runRegistrationTest();
    await runTokenVerificationTest();
    await runProfileTest();
    await runRefreshTokenTest();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 Panel de Pruebas de Autenticación
      </h2>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={runCompleteTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Ejecutando...
              </>
            ) : (
              <>🚀 Ejecutar Suite Completa</>
            )}
          </button>
          
          <button
            onClick={runErrorTests}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? '⏳ Ejecutando...' : '💥 Probar Casos de Error'}
          </button>

          <button
            onClick={runIndividualTests}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? '⏳ Ejecutando...' : '🔍 Pruebas Rápidas'}
          </button>

          <button
            onClick={clearResults}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🧹 Limpiar
          </button>
        </div>

        {state.isAuthenticated && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p><strong>� Usuario autenticado:</strong> {state.user?.nombreUsuario}</p>
            <p><strong>📧 Email:</strong> {state.user?.email}</p>
            <p><strong>🏛️ Fiscalía ID:</strong> {state.user?.idFiscalia}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        {results.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>📋 Presiona un botón para ejecutar las pruebas...</p>
            <p className="text-xs mt-2">Las pruebas verificarán todos los endpoints de tu API</p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`${result.success ? 'text-green-400' : 'text-red-400'} flex items-start gap-2`}
              >
                <span className="text-gray-500 text-xs min-w-[60px]">
                  {result.timestamp}
                </span>
                <span className={result.success ? '' : 'font-semibold'}>
                  {result.message}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-yellow-400 flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
                <span>Ejecutando pruebas...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-gray-800">✅ Pruebas Exitosas</p>
            <p className="text-2xl font-bold text-green-600">
              {results.filter(r => r.success).length}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-gray-800">❌ Pruebas Fallidas</p>
            <p className="text-2xl font-bold text-red-600">
              {results.filter(r => !r.success).length}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-gray-800">📊 Total Ejecutadas</p>
            <p className="text-2xl font-bold text-blue-600">
              {results.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestComponent;
