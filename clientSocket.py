import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("✅ Conectado al servidor Socket.IO")

@sio.on('notifications')
def on_notifications(data):
    print(f"📩 Notificación recibida: {data}")

@sio.event
def disconnect():
    print("❌ Desconectado del servidor")

if __name__ == "__main__":
    try:
        # Puerto por defecto de NestJS: 3000
        sio.connect("http://127.0.0.1:3000", transports=['websocket'])
        sio.wait()
    except Exception as e:
        print("🚨 Error al conectar:", e)