import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // Permite conexiones desde cualquier origen
})
export class NotificationsGateway  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server?: Server;

  // Se ejecuta cuando un cliente se conecta
  handleConnection(client: Socket) {
    const query = client.handshake.query;
    console.log(`Nuevo dispositivo conectado: ${client.id}`);
    console.log('Query del socket:', JSON.stringify(query));

    // Emitir evento de bienvenida al cliente que se conectó
    client.emit('new_notification', { hello: 'world' });
  }

  // Se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    console.log(`Dispositivo desconectado: ${client.id}`);
  }

  // Escuchar un evento llamado 'message' enviado por el cliente
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): string {
    console.log('Mensaje recibido:', data);
    return 'Mensaje recibido correctamente'; // Se retorna al emisor
  }

  // Método utilitario para emitir a TODOS los clientes desde un servicio
  broadcastNotification(payload: any) {
    this.server?.emit(payload.event, payload.data);
  }
}