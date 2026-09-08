import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Carregando from './Carregando'

/**
 * Protege uma rota. `exige="equipe"` restringe à equipe;
 * sem `exige`, basta estar autenticado.
 */
export default function RotaProtegida({ children, exige }) {
  const { autenticado, ehEquipe, carregando } = useAuth()
  const local = useLocation()

  if (carregando) return <Carregando />

  if (!autenticado) {
    return <Navigate to="/entrar" state={{ de: local.pathname }} replace />
  }
  if (exige === 'equipe' && !ehEquipe) {
    return <Navigate to="/organizador" replace />
  }
  return children
}
