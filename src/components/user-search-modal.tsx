interface UserSearchModalProps {
  open: boolean
  onClose: () => void
}

const UserSearchModal = ({ open: _open, onClose }: UserSearchModalProps) => {
  if (!_open) return null
  return (
    <div>
      <h2>User Search</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
export { UserSearchModal }