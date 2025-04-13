import { useState } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface ApiResponse {
  data?: any;
  error?: string;
}

const ApiTest = () => {
  const [result, setResult] = useState<ApiResponse>({});
  const [isLoading, setIsLoading] = useState(false);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Obtener el token y timestamp
    const tokenResponse = await fetch('/api/generate-token');
    const { token, timestamp } = await tokenResponse.json();

    // Configurar headers por defecto
    const defaultHeaders = {
      'x-opencrm-auth': token,
      'x-timestamp': timestamp.toString(),
      'Content-Type': 'application/json',
    };

    // Combinar opciones
    const finalOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Hacer la petición
    const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return response.json();
  };

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await makeAuthenticatedRequest('/api/ping');
      setResult({ data: response });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-test-container">
      <h1>Test API Connection</h1>
      
      <form onSubmit={handleTestApi}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Probando...' : 'Probar API'}
        </button>
      </form>
      
      <div className="result">
        {isLoading ? (
          'Cargando...'
        ) : result.data ? (
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        ) : result.error ? (
          <div className="error">{result.error}</div>
        ) : (
          'Resultado aparecerá aquí...'
        )}
      </div>

      <style>{`
        .api-test-container {
          padding: 2rem;
        }
        
        .result {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          min-height: 100px;
        }

        .error {
          color: red;
        }

        button {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #ccc;
        }

        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
};

export default ApiTest;