import { Component } from 'react'

/** Captura erros de renderização e mostra uma tela amigável em vez de página branca. */
export default class LimiteErro extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro de renderização:', erro, info)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="container-pagina flex flex-col items-center py-24 text-center">
        <p className="font-titulo text-6xl text-destaque">Ops</p>
        <h1 className="mt-2 text-3xl">Algo deu errado nesta tela</h1>
        <p className="mt-2 max-w-md text-suave">
          Recarregue a página. Se o problema continuar, avise a equipe.
        </p>
        <button className="btn-destaque mt-6" onClick={() => window.location.assign('/')}>
          Voltar para o início
        </button>
      </div>
    )
  }
}
