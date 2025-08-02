import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Puro Tailwind, sin componentes raros
const DashboardView = ({ chartData, totalRevenue, totalProductsSold, products }) => (
  <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
    <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
      Panel de Control Financiero
    </h2>
    {/* Cards superiores */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
      {/* Ventas Totales */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition hover:-translate-y-1 hover:shadow-blue-200/40 border">
        <div className="text-2xl font-semibold mb-1 text-blue-600">Ventas Totales</div>
        <div className="text-4xl font-extrabold text-gray-800">${totalRevenue}</div>
      </div>
      {/* Productos Vendidos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition hover:-translate-y-1 hover:shadow-green-200/40 border">
        <div className="text-2xl font-semibold mb-1 text-green-500">Productos Vendidos</div>
        <div className="text-4xl font-extrabold text-gray-800">{totalProductsSold}</div>
      </div>
      {/* Productos en Stock */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition hover:-translate-y-1 hover:shadow-yellow-200/40 border">
        <div className="text-2xl font-semibold mb-1 text-yellow-500">Productos en Stock</div>
        <div className="text-4xl font-extrabold text-gray-800">{Object.keys(products).length}</div>
      </div>
    </div>
    {/* Gráfico de ingresos diarios */}
    <div className="bg-white rounded-2xl shadow-lg p-8 border">
      <div className="text-xl font-bold mb-6 text-indigo-500">Ingresos Diarios</div>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Ingresos" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default DashboardView;
