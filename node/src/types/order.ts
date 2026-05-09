export type Stage = "order_placed"| "processing"| "in_transit"| "out_for_delivery"| "delivered"| "completed"; 

export type outcome = "success" | "failure"

export type actor_type = "customer" | "vendor" 

// const transitions = {
//    order_placed: ["processing", "cancelled"],
//    processing: ["shipped", "cancelled"],
//    shipped: ["in_transit"],
//    in_transit: ["out_for_delivery"],
//    out_for_delivery: ["delivered"],
//    delivered: ["completed", "disputed"]
// };