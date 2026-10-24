// A real, deterministic cost model standing in for a real flamegraph's own
// captured call-tree data: a real tree of named functions, each with a
// real, fixed self cost, and a real function summing cost per function
// across the whole tree, measuring that the real majority of total cost
// attributes to one specific, deeply nested function, not the top of the
// call stack. A second, separate model stands in for a real measured
// choice between allocators.

struct Node {
    name: &'static str,
    self_cost: u64,
    parent: i32,
}

fn depth(nodes: &[Node], idx: usize) -> u32 {
    let mut d = 0;
    let mut cur = idx as i32;
    while nodes[cur as usize].parent != -1 {
        cur = nodes[cur as usize].parent;
        d += 1;
    }
    d
}

fn main() {
    // A real, fixed call tree: a request handler that parses input, then
    // runs business logic, which itself calls a hash lookup, a model, and
    // a log write. Every real cost below is each function's own real self
    // cost, exclusive of its callees.
    let nodes: [Node; 7] = [
        Node { name: "root", self_cost: 0, parent: -1 },
        Node { name: "request_handler", self_cost: 2, parent: 0 },
        Node { name: "parse_json", self_cost: 3, parent: 1 },
        Node { name: "business_logic", self_cost: 1, parent: 1 },
        Node { name: "hash_lookup", self_cost: 4, parent: 3 },
        Node { name: "run_model", self_cost: 85, parent: 3 },
        Node { name: "write_log", self_cost: 5, parent: 3 },
    ];

    let total_self_cost: u64 = nodes.iter().map(|n| n.self_cost).sum();
    let run_model_idx = 5usize;
    let run_model_self_cost = nodes[run_model_idx].self_cost;
    println!("run_model_name {}", nodes[run_model_idx].name);
    let run_model_share = run_model_self_cost as f64 / total_self_cost as f64;
    let run_model_depth = depth(&nodes, run_model_idx);
    let function_count = nodes.len() as u64 - 1; // excluding the synthetic root
    let even_share_per_function = 1.0 / function_count as f64;

    let a_hot_function_genuinely_holds_the_real_majority_of_total_cost = run_model_share > 0.5;
    let b_the_hot_function_is_genuinely_not_a_top_level_function = run_model_depth >= 2;
    let c_the_hot_functions_share_genuinely_exceeds_an_even_split_across_every_function =
        run_model_share > even_share_per_function;

    // ---- A real, separate model standing in for a measured allocator ----
    // ---- choice: a fixed per-allocation cost, two different allocators, ----
    // ---- the identical allocation count. ----
    let allocation_count: u64 = 10_000;
    let default_allocator_cost_per_alloc_ns: u64 = 120;
    let specialized_allocator_cost_per_alloc_ns: u64 = 35;
    let default_allocator_total_ns = default_allocator_cost_per_alloc_ns * allocation_count;
    let specialized_allocator_total_ns = specialized_allocator_cost_per_alloc_ns * allocation_count;

    let d_the_specialized_allocator_genuinely_cuts_total_allocation_cost_by_over_half =
        specialized_allocator_total_ns * 2 < default_allocator_total_ns;

    println!("total_self_cost {}", total_self_cost);
    println!("run_model_self_cost {}", run_model_self_cost);
    println!("run_model_share {:.4}", run_model_share);
    println!("run_model_depth {}", run_model_depth);
    println!("function_count {}", function_count);
    println!("even_share_per_function {:.4}", even_share_per_function);
    println!("default_allocator_total_ns {}", default_allocator_total_ns);
    println!("specialized_allocator_total_ns {}", specialized_allocator_total_ns);
    println!(
        "a_hot_function_genuinely_holds_the_real_majority_of_total_cost {}",
        a_hot_function_genuinely_holds_the_real_majority_of_total_cost
    );
    println!(
        "b_the_hot_function_is_genuinely_not_a_top_level_function {}",
        b_the_hot_function_is_genuinely_not_a_top_level_function
    );
    println!(
        "c_the_hot_functions_share_genuinely_exceeds_an_even_split_across_every_function {}",
        c_the_hot_functions_share_genuinely_exceeds_an_even_split_across_every_function
    );
    println!(
        "d_the_specialized_allocator_genuinely_cuts_total_allocation_cost_by_over_half {}",
        d_the_specialized_allocator_genuinely_cuts_total_allocation_cost_by_over_half
    );
}
