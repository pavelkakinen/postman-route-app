export default function StepNavigator({ stop, stepNumber, totalStops, onDelivered }) {
  return (
    <div className="step-navigator">
      <div className="step-progress">
        Stop <strong>{stepNumber}</strong> of {totalStops}
      </div>
      <div className="step-address">{stop.address}</div>
      {stop.newspaper && <div className="step-newspaper">{stop.newspaper}</div>}
      <button className="delivered-btn" onClick={onDelivered}>
        ✓ Delivered
      </button>
    </div>
  )
}
