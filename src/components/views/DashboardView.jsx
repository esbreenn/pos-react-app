import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const DashboardView = ({ chartData, totalRevenue, totalProductsSold, products }) => (
  <div className="p-8">
    <h2 className="text-3xl font-bold mb-6">Panel de Control Financiero</h2>
    <div className="grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ventas Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-gray-800">${totalRevenue}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Productos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-gray-800">{totalProductsSold}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Productos en Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-gray-800">{Object.keys(products).length}</p>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ingresos Diarios</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Ingresos" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

export default DashboardView;