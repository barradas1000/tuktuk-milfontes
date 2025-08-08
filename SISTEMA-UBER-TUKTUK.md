# Sistema estilo Uber para 1 TukTuk

## 📌 Objetivo

Desenvolver uma aplicação web em React que:

- Mostre um único TukTuk em tempo real no mapa (OpenStreetMap + Leaflet).
- Use Supabase como backend (autenticação + banco + API em tempo real).
- Tenha 2 perfis: Usuário passageiro e Condutor (Admin).
- O Condutor controla se sua localização está ativa ou inativa com um botão LIGA/DESLIGA.

---

## ⚙️ Funcionalidades

### 1. Mapa (Frontend)

- Exibir OpenStreetMap com react-leaflet.
- Mostrar localização atual do TukTuk (pegando coordenadas do Supabase em tempo real).
- Para o passageiro: ponto fixo do TukTuk se ele estiver ativo.
- Para o condutor: botão para publicar/pausar envio da sua localização.

### 2. Backend (Supabase)

- **Tabela `drivers`**
  - `id` (UUID)
  - `name` (string)
  - `is_active` (boolean)
  - `latitude` (float)
  - `longitude` (float)
  - `updated_at` (timestamp)
- **Autenticação Supabase Auth**
  - Condutor faz login como Admin.
  - Passageiro faz login anônimo ou apenas leitura.
- **Regras RLS (Row Level Security)**
  - Condutor só atualiza sua própria linha.
  - Passageiros só podem ler a localização do driver.
- **Realtime (Supabase Realtime)**
  - Frontend escuta atualizações da tabela drivers para atualizar o mapa em tempo real.

### 3. Botão LIGA/DESLIGA (Admin)

- Admin tem interface com:
  - Botão LIGAR rastreamento: ativa `is_active = true` e começa a enviar localização periodicamente usando `navigator.geolocation`.
  - Botão DESLIGAR rastreamento: atualiza `is_active = false` e para envio de localização.
- Quando `is_active = false`:
  - Passageiro vê o TukTuk offline (pode exibir null ou ícone cinza).

### 4. Fluxo de localização

- Condutor faz login.
- Aperta LIGAR.
- App inicia `navigator.geolocation.watchPosition()`.
- Atualiza Supabase com nova latitude e longitude a cada X segundos.
- Passageiro conectado ao mapa recebe updates via Supabase Realtime.

---

## 🗂️ Sugestão de estrutura

```
/src
  /components
    DriverMap.tsx
    PassengerMap.tsx
    ToggleTrackingButton.tsx
  /pages
    Admin.tsx
    Home.tsx
  /supabase
    client.ts
```

---

## 🧩 Exemplos de trechos importantes

### Exemplo de envio de localização (Admin)

```js
import { supabase } from "../supabase";

let watchId;

function startTracking(driverId) {
  watchId = navigator.geolocation.watchPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    await supabase
      .from("drivers")
      .update({
        latitude,
        longitude,
        updated_at: new Date(),
      })
      .eq("id", driverId);
  });
}

function stopTracking() {
  navigator.geolocation.clearWatch(watchId);
}
```

### Exemplo do botão Liga/Desliga

```jsx
<button onClick={() => {
  startTracking(driverId);
  supabase.from('drivers').update({ is_active: true }).eq('id', driverId);
}}>LIGAR</button>

<button onClick={() => {
  stopTracking();
  supabase.from('drivers').update({ is_active: false }).eq('id', driverId);
}}>DESLIGAR</button>
```

### Exemplo de mapa consumindo localização

```jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function PassengerMap() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel("drivers")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers" },
        (payload) => {
          setLocation({
            lat: payload.new.latitude,
            lng: payload.new.longitude,
            isActive: payload.new.is_active,
          });
        }
      )
      .subscribe();

    // Carregar inicial
    const fetchDriver = async () => {
      const { data } = await supabase.from("drivers").select("*").single();
      setLocation({
        lat: data.latitude,
        lng: data.longitude,
        isActive: data.is_active,
      });
    };

    fetchDriver();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MapContainer center={[0, 0]} zoom={13} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {location?.isActive && (
        <Marker position={[location.lat, location.lng]}>
          <Popup>TukTuk disponível</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
```

---

## ✅ Resultado final

- 1 TukTuk ativo ou não no mapa.
- Motorista controla se está visível.
- Passageiro vê em tempo real a posição se o motorista estiver online.
