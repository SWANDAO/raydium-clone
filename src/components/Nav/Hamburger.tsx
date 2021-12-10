interface Props {
  isOpen: boolean;
}

export default function Hamburger (props: Props) {
  const { isOpen } = props

  return (
    <div className={isOpen ? 'hamburger' : 'hamburger open-menu'}>
      <div className="burger burger1" />
      <div className="burger burger2" />
      <div className="burger burger3" />
    </div>
  )
}
