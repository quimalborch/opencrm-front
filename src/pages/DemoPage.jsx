import React from 'react';

const DemoPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Página de Demostración</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 leading-relaxed">
          Esta es una página de demostración para mostrar la estructura básica del dashboard. 
          Aquí podrás ver cómo se integran los diferentes componentes y cómo funciona la 
          navegación a través del menú lateral. En un entorno de producción, esta página 
          contendría información relevante para tu CRM, como estadísticas, gráficos o 
          listados de clientes.
        </p>
      </div>
    </div>
  );
};

export default DemoPage; 