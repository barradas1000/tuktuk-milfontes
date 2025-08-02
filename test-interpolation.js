// Teste da função de interpolação
function interpolateMessage(message, variables) {
  console.log("=== TESTE interpolateMessage ===");
  console.log("Mensagem original:", message);
  console.log("Variáveis:", variables);

  const result = message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const replacement = variables[key] || match;
    console.log(`Substituindo ${match} por ${replacement}`);
    return replacement;
  });

  console.log("Resultado final:", result);
  console.log("=== FIM TESTE ===");

  return result;
}

// Teste com mensagem em inglês
const englishMessage =
  "Hello {{name}}, your reservation for the tour '{{tour_type}}' is confirmed for {{reservation_date}} at {{reservation_time}}! Meet us in the center of Milfontes, next to the public garden. Any questions, we are at your disposal.";

const testVariables = {
  name: "John Doe",
  tour_type: "Panoramic tour of the village",
  reservation_date: "2024-01-15",
  reservation_time: "14:00",
  total_price: "25",
};

console.log("Testando interpolação em inglês:");
interpolateMessage(englishMessage, testVariables);

// Teste com mensagem em espanhol
const spanishMessage =
  "Hola {{name}}, ¡su reserva para el tour '{{tour_type}}' está confirmada para el día {{reservation_date}} a las {{reservation_time}}! Encuéntrenos en el centro de Milfontes, junto al jardín público. Cualquier duda, estamos a su disposición.";

console.log("\nTestando interpolação em espanhol:");
interpolateMessage(spanishMessage, testVariables);
