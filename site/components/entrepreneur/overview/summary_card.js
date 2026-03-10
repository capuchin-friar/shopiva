
export default function SummaryCard({summary_title, summary_icon, summary_value, summary_comment}) {
  return (
    <>
      <div className="summary_card">
        <div className="summary_card_top">
          <span className="summary_title">
            <h6>{summary_title}</h6>
          </span>
          <span className="summary_icon">
            {summary_icon}
          </span>
        </div>
        <div className="summary_card_btm">
          <span className="summary_value">
            <h5>{summary_value}</h5>
          </span>

          <div className="summary_comment">
            {summary_comment.split(' ').map((item, index) => (
              <small>
                <span key={index}>
                  {item.replace(/-/g, " ")}{" "}
                </span>
              </small>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
