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
    image: "https://euroveloportugal.com/files/2016/03/praia-da-franquia-2.jpg",
  },
  {
    name: "Praia do Farol",
    category: "Praias",
    coords: [37.718758, -8.790392],
    description: "poi.farol.description",
    image:
      "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2025/awards/p64.Farol2.340x190.jpg",
  },
  {
    name: "Praia do Malhão",
    category: "Praias",
    coords: [37.783864, -8.801333],
    description: "poi.malhao.description",
    image:
      "https://images.turismoenportugal.org/Praia-do-Malhao-Vila-Nova-de-Mil-Fontes.jpg",
  },
  {
    name: "Praia das Furnas",
    category: "Praias",
    coords: [37.719489, -8.7838],
    description: "poi.furnas.description",
    image: "https://placehold.co/600x400/008080/FFFFFF?text=Praia+das+Furnas",
  },
  {
    name: "Praia do Patacho",
    category: "Praias",
    coords: [37.725596, -8.792988],
    description: "poi.patacho.description",
    image: "https://placehold.co/600x400/008080/FFFFFF?text=Praia+do+Patacho",
  },
  {
    name: "Praia do Carreiro das Fazendas",
    category: "Praias",
    coords: [37.723423, -8.79201],
    description: "poi.carreiro.description",
    image: "https://placehold.co/600x400/008080/FFFFFF?text=Praia+do+Carreiro",
  },
  {
    name: "Praia do Porto das Barcas",
    category: "Praias",
    coords: [37.734612, -8.796488],
    description: "poi.portoBarcas.description",
    image: "https://placehold.co/600x400/008080/FFFFFF?text=Porto+das+Barcas",
  },
  {
    name: "Praia dos Aivados",
    category: "Praias",
    coords: [37.806233, -8.796916],
    description: "poi.aivados.description",
    image: "https://placehold.co/600x400/008080/FFFFFF?text=Praia+dos+Aivados",
  },
  {
    name: "Forte de São Clemente",
    category: "História e Cultura",
    coords: [37.7231734, -8.7835174],
    description: "poi.forte.description",
    image: "https://placehold.co/600x400/A52A2A/FFFFFF?text=Forte+S.+Clemente",
  },
  {
    name: "Farol de Vila Nova de Milfontes",
    category: "História e Cultura",
    coords: [37.7195, -8.790139],
    description: "poi.farolMilfontes.description",
    image: "https://placehold.co/600x400/A52A2A/FFFFFF?text=Farol",
  },
  {
    name: "Igreja de Nossa Senhora da Graça",
    category: "História e Cultura",
    coords: [37.723494, -8.782072],
    description: "poi.igreja.description",
    image:
      "https://pt.m.wikipedia.org/wiki/Ficheiro:Church_in_Vila_nova_de_Milfontes.jpg",
  },
  {
    name: "Estátua do Arcanjo",
    category: "História e Cultura",
    coords: [37.719501, -8.79014],
    description: "poi.arcanjo.description",
    image:
      "https://placehold.co/600x400/A52A2A/FFFFFF?text=Est%C3%A1tua+do+Arcanjo",
  },
  {
    name: "Jardim Público",
    category: "Espaços Verdes",
    coords: [37.727778, -8.782167],
    description: "poi.jardimPublico.description",
    image:
      "https://placehold.co/600x400/228B22/FFFFFF?text=Jardim+P%C3%BAblico",
  },
  {
    name: "Parque Natural do Sudoeste Alentejano",
    category: "Espaços Verdes",
    coords: [37.75, -8.79],
    description: "poi.parqueNatural.description",
    image: "https://placehold.co/600x400/228B22/FFFFFF?text=Parque+Natural",
  },
  {
    name: "Parque Infantil",
    category: "Espaços Verdes",
    coords: [37.7277585, -8.7818885],
    description: "poi.parqueInfantil.description",
    image: "https://placehold.co/600x400/228B22/FFFFFF?text=Parque+Infantil",
  },
  {
    name: "Jardim Paragem dos Autocarros",
    category: "Espaços Verdes",
    coords: [37.7310194, -8.7827907],
    description: "poi.jardimParagem.description",
    image: "https://placehold.co/600x400/228B22/FFFFFF?text=Jardim+Paragem",
  },
  {
    name: "Estuário do Rio Mira",
    category: "Espaços Verdes",
    coords: [37.7250949, -8.7873245],
    description: "poi.rioMira.description",
    image: "https://placehold.co/600x400/228B22/FFFFFF?text=Rio+Mira",
  },
  {
    name: "Restaurante A Choupana",
    category: "Gastronomia",
    coords: [37.718759, -8.790393],
    description: "poi.choupana.description",
    image:
      "https://turismo.cm-odemira.pt/thumbs/cmodemira/uploads/poi/image/670/onde_comer_a_choupana_vn_milfontes_1_1024_2500.jpg",
  },
  {
    name: "Tasca do Celso",
    category: "Gastronomia",
    coords: [37.724358, -8.783387],
    description: "poi.tascaCelso.description",
    image: "https://placehold.co/600x400/FFA500/FFFFFF?text=Tasca+do+Celso",
  },
  {
    name: "A Manjedoura",
    category: "Gastronomia",
    coords: [37.726, -8.784],
    description: "poi.manjedoura.description",
    image: "https://placehold.co/600x400/FFA500/FFFFFF?text=A+Manjedoura",
  },
  {
    name: "Restaurante HS Milfontes Beach",
    category: "Gastronomia",
    coords: [37.721, -8.788],
    description: "poi.hsBeach.description",
    image: "https://placehold.co/600x400/FFA500/FFFFFF?text=HS+Milfontes+Beach",
  },
  {
    name: "Mercado de Vila Nova de Milfontes",
    category: "Comércio",
    coords: [37.729768, -8.784901],
    description: "poi.mercadoMilfontes.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=Mercado",
  },
  {
    name: "Mercado das Brunheiras",
    category: "Comércio",
    coords: [37.752948, -8.755478],
    description: "poi.brunheiras.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=Mercado+Brunheiras",
  },
  {
    name: "Milsuper",
    category: "Comércio",
    coords: [37.728, -8.783],
    description: "poi.milsuper.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=Milsuper",
  },
  {
    name: "Meu Super",
    category: "Comércio",
    coords: [37.725, -8.781],
    description: "poi.meusuper.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=Meu+Super",
  },
  {
    name: "Frutas e Companhia Amanhecer",
    category: "Comércio",
    coords: [37.729724, -8.781062],
    description: "poi.amanhecer.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=Amanhecer",
  },
  {
    name: "Supermercado SPAR",
    category: "Comércio",
    coords: [37.7285317, -8.7824555],
    description: "poi.spar.description",
    image: "https://placehold.co/600x400/4682B4/FFFFFF?text=SPAR",
  },
  {
    name: "Orbitur Sitava Milfontes",
    category: "Alojamento",
    coords: [37.779722, -8.783333],
    description: "poi.orbitur.description",
    image: "https://placehold.co/600x400/8A2BE2/FFFFFF?text=Orbitur+Sitava",
  },
  {
    name: "Campiférias",
    category: "Alojamento",
    coords: [37.7289368, -8.7849212],
    description: "poi.campiferias.description",
    image: "https://placehold.co/600x400/8A2BE2/FFFFFF?text=Campif%C3%A9rias",
  },
  {
    name: "Camping Milfontes",
    category: "Alojamento",
    coords: [37.7303001, -8.7858204],
    description: "poi.camping.description",
    image: "https://placehold.co/600x400/8A2BE2/FFFFFF?text=Camping+Milfontes",
  },
  {
    name: "Ponte sobre o Rio Mira",
    category: "Atividades e Outros",
    coords: [37.7248386, -8.7824351],
    description: "poi.ponte.description",
    image: "https://placehold.co/600x400/FF4500/FFFFFF?text=Ponte",
  },
  {
    name: "Passeios de Barco no Rio Mira",
    category: "Atividades e Outros",
    coords: [37.7225, -8.788],
    description: "poi.barco.description",
    image: "https://placehold.co/600x400/FF4500/FFFFFF?text=Passeios+de+Barco",
  },
  {
    name: "Trilhos da Rota Vicentina",
    category: "Atividades e Outros",
    coords: [37.74, -8.795],
    description: "poi.vicentina.description",
    image: "https://placehold.co/600x400/FF4500/FFFFFF?text=Rota+Vicentina",
  },
  {
    name: "Spots de Surf e Kayak",
    category: "Atividades e Outros",
    coords: [37.72, -8.789],
    description: "poi.surfkayak.description",
    image: "https://placehold.co/600x400/FF4500/FFFFFF?text=Surf+%26+Kayak",
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
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                  <br />
                  {t(poi.description)}
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
