import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Corrige o ícone padrão do Leaflet no React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const pointsOfInterest = [
  {
    name: "Praia da Franquia",
    category: "Praias",
    coords: [37.722123, -8.787765],
    description: "poi.franquia.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/foz%20do%20mira.jpg",
    mapDescriptionKey: "praiaDaFranquia",
  },
  {
    name: "Praia do Farol",
    category: "Praias",
    coords: [37.719528, -8.788829],
    description: "poi.farol.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/praia_do_farol_main_1_1024_2500.jpg",
    mapDescriptionKey: "praiaDoFarol",
  },
  {
    name: "Praia do Malhão",
    category: "Praias",
    coords: [37.783864, -8.801333],
    description: "poi.malhao.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Praia%20do%20Malh%C3%A3o.jpg",
    mapDescriptionKey: "praiaDoMalhao",
  },
  {
    name: "Praia das Furnas",
    category: "Praias",
    coords: [37.714565, -8.785865],
    description: "poi.furnas.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/praia%20das%20furnas.jpg",
    mapDescriptionKey: "praiaDasFurnas",
  },
  {
    name: "Praia do Patacho",
    category: "Praias",
    coords: [37.725596, -8.792988],
    description: "poi.patacho.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Praia%20do%20Patacho.webp",
    mapDescriptionKey: "praiaDoPatacho",
  },
  {
    name: "Praia do Carreiro das Fazendas",
    category: "Praias",
    coords: [37.723423, -8.79201],
    description: "poi.carreiro.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Praia%20do%20Carreiro%20das%20Fazendas.jpeg",
    mapDescriptionKey: "praiaDoCarreiroDasFazendas",
  },
  {
    name: "Praia do Porto das Barcas",
    category: "Praias",
    coords: [37.734612, -8.796488],
    description: "poi.portoBarcas.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Praia%20do%20Porto%20das%20Barcas.jpg",
    mapDescriptionKey: "praiaDoPortoDasBarcas",
  },
  {
    name: "Praia dos Aivados",
    category: "Praias",
    coords: [37.806233, -8.796916],
    description: "poi.aivados.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Praia%20dos%20Aivados.jpeg",
    mapDescriptionKey: "praiaDosAivados",
  },
  {
    name: "Forte de São Clemente",
    category: "História e Cultura",
    coords: [37.72279, -8.782837],
    description: "poi.forte.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Forte%20de%20S%C3%A3o%20Clemente.jpeg",
    mapDescriptionKey: "forteDeSaoClemente",
  },
  {
    name: "Farol de Vila Nova de Milfontes",
    category: "História e Cultura",
    coords: [37.719537, -8.790124],
    description: "poi.farolMilfontes.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/praia_do_farol_main_1_1024_2500.jpg",
    mapDescriptionKey: "farolDeVilaNovaDeMilfontes",
  },
  {
    name: "Igreja de Nossa Senhora da Graça",
    category: "História e Cultura",
    coords: [37.72348, -8.781912],
    description: "poi.igreja.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Igreja%20de%20Nossa%20Senhora%20da%20Gra%C3%A7a.jpeg",
    mapDescriptionKey: "igrejaDeNossaSenhoraDaGrca",
  },
  {
    name: "Estátua do Arcanjo",
    category: "História e Cultura",
    coords: [37.7192726, -8.7900765, 300],
    description: "poi.arcanjo.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Est%C3%A1tua%20do%20Arcanjo.jpeg",
    mapDescriptionKey: "estaturaDoArcanjo",
  },
  {
    name: "Jardim Público",
    category: "Espaços Verdes",
    coords: [37.727778, -8.782167],
    description: "poi.jardimPublico.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/jardim%20publico.jpeg",
    mapDescriptionKey: "jardimPublico",
  },
  {
    name: "Parque Natural do Sudoeste Alentejano",
    category: "Espaços Verdes",
    coords: [37.75, -8.79],
    description: "poi.parqueNatural.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Parque%20Natural%20do%20Sudoeste%20Alentejano.jpeg",
    mapDescriptionKey: "parqueNaturalDoSudoesteAlentejano",
  },
  {
    name: "Parque Infantil",
    category: "Espaços Verdes",
    coords: [37.7277585, -8.7818885],
    description: "poi.parqueInfantil.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Parque%20Infantil.jpeg",
    mapDescriptionKey: "parqueInfantil",
  },
  {
    name: "Jardim Paragem dos Autocarros",
    category: "Espaços Verdes",
    coords: [37.730058, -8.781321],
    description: "poi.jardimParagem.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Jardim%20Paragem%20dos%20Autocarros.jpeg",
    mapDescriptionKey: "jardimParagemDosAutocarros",
  },
  {
    name: "Estuário do Rio Mira",
    category: "Espaços Verdes",
    coords: [37.718379, -8.790213],
    description: "poi.rioMira.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/foz%20do%20mira.jpg",
    mapDescriptionKey: "estuarioDoRioMira",
  },
  {
    name: "Restaurante A Choupana",
    category: "Gastronomia",
    coords: [37.719538, -8.790887],
    description: "poi.choupana.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/restaurante%20Oasis.jpg",
    mapDescriptionKey: "restauranteAChoupana",
  },
  {
    name: "Tasca do Celso",
    category: "Gastronomia",
    coords: [37.724358, -8.783387],
    description: "poi.tascaCelso.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/tasca%20do%20celso.webp",
    mapDescriptionKey: "tascaDoCelso",
  },
  {
    name: "A Manjedoura",
    category: "Gastronomia",
    coords: [37.725019, -8.782959],
    description: "poi.manjedoura.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/A%20Manjedoura.webp",
    mapDescriptionKey: "aManjedoura",
  },
  {
    name: "Restaurante Ritual",
    category: "Gastronomia",
    coords: [37.7232162, -8.7825274],
    description: "Restaurante de cozinha contemporânea em Milfontes.",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/restaurante%20ritual.webp",
    mapDescriptionKey: "restauranteRitual",
  },
  {
    name: "Pátio Alentejano",
    category: "Gastronomia",
    coords: [37.727237, -8.779655],
    description: "Restaurante típico alentejano em Milfontes.",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/patio%20alentejano.png",
    mapDescriptionKey: "patioAlentejano",
  },
  {
    name: "Restaurante HS Milfontes Beach",
    category: "Gastronomia",
    coords: [37.723631, -8.783987],
    description: "poi.hsBeach.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Restaurante%20HS%20Milfontes%20Beach.jpeg",
    mapDescriptionKey: "restauranteHSMilfontesBeach",
  },
  {
    name: "Restaurante Oasis",
    category: "Gastronomia",
    coords: [37.71915, -8.783492],
    description: "Restaurante com vista para o mar em Milfontes.",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/restaurante%20Oasis.jpg",
    mapDescriptionKey: "restauranteOasis",
  },
  {
    name: "Mercado de Vila Nova de Milfontes",
    category: "Comércio",
    coords: [37.7290601, -8.7831253, 30],
    description: "poi.mercadoMilfontes.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Mercado%20de%20Vila%20Nova%20de%20Milfontes.jpeg",
    mapDescriptionKey: "mercadoDeVilaNovaDeMilfontes",
  },
  {
    name: "Mercado das Brunheiras",
    category: "Comércio",
    coords: [37.752948, -8.755478],
    description: "poi.brunheiras.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Mercado%20das%20Brunheiras.jpeg",
    mapDescriptionKey: "mercadoDasBrunheiras",
  },
  {
    name: "Milsuper",
    category: "Comércio",
    coords: [37.7275795, -8.7784187, 30],
    description: "poi.milsuper.description",
    image: "https://tuktuk-milfontes.vercel.app/lovable-uploads/Milsuper.jpeg",
    mapDescriptionKey: "milsuper",
  },
  {
    name: "Meu Super",
    category: "Comércio",
    coords: [37.728623, -8.777167],
    description: "poi.meusuper.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Meu%20Super.jpeg",
    mapDescriptionKey: "meuSuper",
  },
  {
    name: "Frutas e Companhia Amanhecer",
    category: "Comércio",
    coords: [37.729724, -8.781062],
    description: "poi.amanhecer.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Frutas%20e%20Companhia%20Amanhecer.jpeg",
    mapDescriptionKey: "frutasECompanhiaAmanhecer",
  },
  {
    name: "Supermercado SPAR",
    category: "Comércio",
    coords: [37.7293115, -8.7812659, 30],
    description: "poi.spar.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Supermercado%20SPAR.jpg",
    mapDescriptionKey: "supermercadoSPAR",
  },
  {
    name: "Orbitur Sitava Milfontes",
    category: "Alojamento",
    coords: [37.779822, -8.7847885],
    description: "poi.orbitur.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/foz%20do%20mira.jpg",
    mapDescriptionKey: "orbiturSitavaMilfontes",
  },
  {
    name: "Campiférias",
    category: "Alojamento",
    coords: [37.7294887, -8.7833768, 30],
    description: "poi.campiferias.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Campif%C3%A9rias.jpeg",
    mapDescriptionKey: "campifrias",
  },
  {
    name: "Camping Milfontes",
    category: "Alojamento",
    coords: [37.7317442, -8.7830879],
    description: "poi.camping.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Camping%20Milfontes.jpeg",
    mapDescriptionKey: "campingMilfontes",
  },
  {
    name: "Ponte sobre o Rio Mira",
    category: "Atividades e Outros",
    coords: [37.7267879, -8.7699768],
    description: "poi.ponte.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Ponte%20sobre%20o%20Rio%20Mira.jpg",
    mapDescriptionKey: "ponteSobreORioMira",
  },
  {
    name: "Passeios de Barco no Rio Mira",
    category: "Atividades e Outros",
    coords: [37.722465, -8.782236],
    description: "poi.barco.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Passeios%20de%20Barco%20no%20Rio%20Mira.jpeg",
    mapDescriptionKey: "passeiosDeBarcoNoRioMira",
  },
  {
    name: "Spots de Surf e Kayak",
    category: "Atividades e Outros",
    coords: [37.723056, -8.785003],
    description: "poi.surfkayak.description",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Spots%20de%20Surf%20e%20Kayak.jpg",
    mapDescriptionKey: "spotsDeSurfEKayak",
  },
  {
    name: "Portinho do Canal",
    category: "Atividades e Outros",
    coords: [37.7370871, -8.8011841],
    description: "Porto de pesca tradicional e zona de lazer.",
    image:
      "https://tuktuk-milfontes.vercel.app/lovable-uploads/Portinho%20do%20Canal.jpg",
    mapDescriptionKey: "portinhoDoCanal",
  },
];

const mapStyle: React.CSSProperties = {
  height: "70vh",
  width: "100%",
  borderRadius: "12px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  margin: "auto",
};

const titleStyle: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(255,255,255,0.85)",
  padding: 10,
  borderRadius: 5,
  fontFamily: "Arial, sans-serif",
  fontSize: 18,
  fontWeight: "bold",
  zIndex: 1000,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

interface MilfontesLeafletMapProps {
  onClose?: () => void;
}

const MilfontesLeafletMap: React.FC<MilfontesLeafletMapProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
    // Scroll para o próximo elemento após o mapa
    setTimeout(() => {
      const nextSection = document.getElementById("explore-section");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  return (
    <div id="milfontes-leaflet-map" style={{ position: "relative" }}>
      <button
        onClick={handleExit}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {t("map.exitMap")}
      </button>
      <div style={{ position: "relative", width: "100%", margin: "auto" }}>
        <div style={titleStyle}>{t("map.description")}</div>
        <MapContainer
          center={[37.725, -8.783]}
          zoom={14}
          scrollWheelZoom={true}
          style={mapStyle}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            options={{
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }}
          />
          {pointsOfInterest.map((poi) => (
            <Marker key={poi.name} position={poi.coords as [number, number]}>
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <b>{poi.name}</b>
                  <br />
                  <img
                    src={poi.image}
                    alt={poi.name}
                    style={{
                      width: 200,
                      height: "auto",
                      borderRadius: 5,
                      marginBottom: 5,
                    }}
                  />
                  <div style={{ fontSize: 14, color: "#444", marginBottom: 4 }}>
                    {t(`mapDescriptions.${poi.mapDescriptionKey}`)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MilfontesLeafletMap;
