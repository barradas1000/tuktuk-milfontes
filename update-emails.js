import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://iweurnqdomiqlohvaoat.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc')

// Atualize para o user_id correto e novo email
async function updateEmail(userId, newEmail) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, { email: newEmail })
  if (error) {
    console.error(`Erro ao atualizar ${userId}:`, error)
  } else {
    console.log(`Email atualizado para ${newEmail}:`, data)
  }
}

// Exemplo de uso:
updateEmail('6f218547-7327-48e5-b048-9f8870164c9e', 'diogo.carias@outlook.pt')
updateEmail('84c11917-bf3b-4eb1-a895-1b6c75c40ba4', 'sonia.santos.scps82@gmail.com')