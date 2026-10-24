#[derive(Clone, Copy)]
struct MemOp {
    address: usize,
    length: usize,
}

const BUFFER_SIZE: usize = 16;

fn is_out_of_bounds(op: MemOp, buffer_len: usize) -> bool {
    op.address + op.length > buffer_len
}

// A tiny, real interpreter over one program with a real branch: it checks
// bounds only on the ops belonging to the branch this run actually takes.
// The other branch's own ops are never even read, let alone checked.
struct RunReport {
    violation_at: Option<usize>,
    ops_examined: usize,
}

fn execute(take_safe_branch: bool, buffer_len: usize) -> RunReport {
    let safe_branch_ops = [
        MemOp { address: 0, length: 4 },
        MemOp { address: 4, length: 8 },
        MemOp { address: 12, length: 4 },
    ];
    // The identical, genuinely out-of-bounds operation (10 + 10 = 20 > 16)
    // sits on this branch, reachable only when take_safe_branch is false.
    let other_branch_ops = [
        MemOp { address: 0, length: 4 },
        MemOp { address: 10, length: 10 },
    ];

    let taken_ops: &[MemOp] = if take_safe_branch { &safe_branch_ops } else { &other_branch_ops };
    let mut violation_at = None;
    let mut ops_examined = 0;
    for (i, &op) in taken_ops.iter().enumerate() {
        ops_examined += 1;
        if is_out_of_bounds(op, buffer_len) {
            violation_at = Some(i);
            break;
        }
    }
    RunReport { violation_at, ops_examined }
}

fn main() {
    let run_on_safe_branch = execute(true, BUFFER_SIZE);
    let run_on_other_branch = execute(false, BUFFER_SIZE);

    let a_the_run_that_takes_the_safe_branch_genuinely_reports_no_violation =
        run_on_safe_branch.violation_at.is_none();
    let b_the_run_that_takes_the_other_branch_genuinely_catches_the_violation =
        run_on_other_branch.violation_at == Some(1);

    // The violation on the other branch is real and checkable the moment a
    // run actually takes that branch; a run that takes the safe branch
    // examines zero of the other branch's own operations to find that out.
    let c_the_run_that_takes_the_safe_branch_genuinely_examines_none_of_the_other_branchs_ops =
        run_on_safe_branch.ops_examined == 3 && run_on_other_branch.ops_examined == 2;

    println!("run_on_safe_branch.violation_at {:?}", run_on_safe_branch.violation_at);
    println!("run_on_safe_branch.ops_examined {}", run_on_safe_branch.ops_examined);
    println!("run_on_other_branch.violation_at {:?}", run_on_other_branch.violation_at);
    println!("run_on_other_branch.ops_examined {}", run_on_other_branch.ops_examined);
    println!(
        "a_the_run_that_takes_the_safe_branch_genuinely_reports_no_violation {}",
        a_the_run_that_takes_the_safe_branch_genuinely_reports_no_violation
    );
    println!(
        "b_the_run_that_takes_the_other_branch_genuinely_catches_the_violation {}",
        b_the_run_that_takes_the_other_branch_genuinely_catches_the_violation
    );
    println!(
        "c_the_run_that_takes_the_safe_branch_genuinely_examines_none_of_the_other_branchs_ops {}",
        c_the_run_that_takes_the_safe_branch_genuinely_examines_none_of_the_other_branchs_ops
    );
}
