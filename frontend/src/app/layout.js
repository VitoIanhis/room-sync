export const metadata = {
  title: 'RoomSync',
  description: 'Sistema acadêmico de reserva de salas - AC1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

