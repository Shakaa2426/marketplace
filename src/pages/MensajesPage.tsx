import { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';

interface MensajesPageProps {
  user: any;
  conversaciones: any[];
  mensajes: any[];
  conversacionActual: string | null;
  onSeleccionarConversacion: (id: string) => void;
  onEnviarMensaje: (receptorId: string, mensaje: string) => Promise<void>;
}

export function MensajesPage({ 
  user,
  conversaciones, 
  mensajes, 
  conversacionActual, 
  onSeleccionarConversacion,
  onEnviarMensaje 
}: MensajesPageProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLista, setShowLista] = useState(true);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const conversacionSeleccionada = conversaciones.find(c => c.id === conversacionActual);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacionSeleccionada) return;

    setLoading(true);
    try {
      await onEnviarMensaje(conversacionSeleccionada.otroUsuario.id, nuevoMensaje);
      setNuevoMensaje('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return formatearHora(fecha);
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-neutral-50">
      <div className="container mx-auto h-full flex">
        {/* Lista de conversaciones */}
        <div className={`
          ${showLista ? 'block' : 'hidden'}
          md:block w-full md:w-80 bg-white border-r border-neutral-200 flex flex-col
        `}>
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-neutral-900">Mensajes</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversaciones.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-neutral-600">No tienes conversaciones</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Contacta a un vendedor para comenzar
                </p>
              </div>
            ) : (
              conversaciones.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSeleccionarConversacion(conv.id);
                    setShowLista(false);
                  }}
                  className={`w-full p-4 border-b border-neutral-200 hover:bg-neutral-50 transition-colors text-left ${
                    conversacionActual === conv.id ? 'bg-guinda-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-guinda-700 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-neutral-900 truncate">
                          {conv.otroUsuario?.nombre || 'Usuario'}
                        </h3>
                        <span className="text-xs text-neutral-500 flex-shrink-0">
                          {formatearFecha(conv.ultimoMensajeFecha)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 truncate">
                        {conv.ultimoMensaje}
                      </p>
                    </div>
                    {conv.noLeidos > 0 && (
                      <div className="w-5 h-5 bg-error-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {conv.noLeidos}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className={`
          ${!showLista || conversacionActual ? 'flex' : 'hidden'}
          md:flex flex-1 flex-col bg-white
        `}>
          {conversacionSeleccionada ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
                <button
                  onClick={() => setShowLista(true)}
                  className="md:hidden p-2 hover:bg-neutral-100 rounded"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-guinda-700 text-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-neutral-900">
                    {conversacionSeleccionada.otroUsuario?.nombre || 'Usuario'}
                  </h3>
                  <p className="text-sm text-neutral-500">En línea</p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensajes.map(mensaje => {
                  const esMio = mensaje.emisorId === user.id;
                  return (
                    <div
                      key={mensaje.id}
                      className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${esMio ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          esMio 
                            ? 'bg-guinda-700 text-white' 
                            : 'bg-neutral-100 text-neutral-900'
                        }`}>
                          <p className="break-words">{mensaje.mensaje}</p>
                        </div>
                        <p className={`text-xs text-neutral-500 mt-1 ${
                          esMio ? 'text-right' : 'text-left'
                        }`}>
                          {formatearHora(mensaje.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={mensajesEndRef} />
              </div>

              {/* Input de mensaje */}
              <form onSubmit={handleEnviar} className="p-4 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading || !nuevoMensaje.trim()}
                    className="px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-neutral-400" />
                </div>
                <p>Selecciona una conversación para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
