let filing_method = {
    married_joint: "married_joint",
    married_sep: "married_sep",
    single: "single",
    head_of_household: "head_of_household",
}

let tax_percentages = [
    0.0535,
    0.0680,
    0.0785,
    0.0985,
]

let income_ranges = {
    married_joint: [{
        min: 0,
        max: 41050,
    }, {
        min: 41051,
        max: 163060
    }, {
        min: 163061,
        max: 284810,
    }, {
        min: 283811,
        max: Number.MAX_SAFE_INTEGER,
    }],
    married_sep: [{
        min: 0,
        max: 20525,
    },{
        min: 20526,
        max: 81530,
    }, {
        min: 81531,
        max: 142405,
    }, {
        min: 142406,
        max: Number.MAX_SAFE_INTEGER,
    }],
    single: [{
        min: 0,
        max: 28080,
    },{
        min: 28081,
        max: 92230,
    }, {
        min: 92231,
        max: 171220,
    }, {
        min: 171221,
        max: Number.MAX_SAFE_INTEGER,
    }],
    head_of_household: [{
        min: 0,
        max: 34570,
    },{
        min: 34571,
        max: 138890,
    }, {
        min: 138891,
        max: 227600,
    }, {
        min: 227601,
        max: Number.MAX_SAFE_INTEGER,
    }],
}

let standard_deductions = {
    married_joint: 25800,
    married_sep: 12900,
    single: 12900,
    head_of_household: 19400,
    dependant_exemption: 4450,
}

function calculate_taxes_owed(
    taxable_income, filing_method, 
) {
    let thresholds = income_ranges[filing_method];
    if (!thresholds) return console.error("Invalid filing method:", filing_method);
    let not_yet_taxed = taxable_income;
    let total_taxes_owed = 0;
    for (let i = 0; i < 4; i++) {
        let threshold = thresholds[i];
        if (taxable_income > threshold.max) {
            total_taxes_owed += threshold.max * tax_percentages[i];
            not_yet_taxed -= threshold.max;
        } else if (taxable_income > threshold.min) {
            total_taxes_owed += not_yet_taxed * tax_percentages[i];
        } else {
            break;
        }
    }
    return total_taxes_owed;
}

function calculate_deduction(
    manual_deduction,
    filing_method,
) {
    if (!manual_deduction || manual_deduction < standard_deductions[filing_method]) {
        return standard_deductions[filing_method];
    }
    return manual_deduction;
}

function calculate_taxable_income(
    total_income,
    filing_method,
    deductions,
    credits,
) {
    console.log("calculate_taxable_income", total_income, filing_method, deductions, credits);
    console.log("total deductions", deductions)
    if (!credits) {
        credits = 0;
    }
    if (deductions + credits > total_income) {
        return 0
    }
    return (total_income - deductions - credits);
}

/**
 * 
 * @param {string} cadence 
 * @param {Date} last_pay_date 
 */
function calculate_remaining_pay_periods(
    cadence,
    last_pay_date,
) {
    let now = new Date();
    switch (cadence) {
        case "twice_monthly":{
            let remaining_in_month = 1;
            if (last_pay_date.getDate() >= 30) {
                remaining_in_month = 0
            }
            let months_left = (12 - (last_pay_date.getMonth() + 1))
            return (months_left * 2) + remaining_in_month;
        }
        case "bi_weekly":{
            let periods_next_year = 0;
            let ret = 0;
            while (periods_next_year < 2) {
                
            }
            break;
        }
        case "monthly":{

            break;
        }
        case "weekly":
        default: {
            break;
        }
    }
}

/**@type HTMLInputElement */
let income_el = document.getElementById("total-income");
/**@type HTMLInputElement */
let deductions_el = document.getElementById("total-deductions");
/**@type HTMLInputElement */
let credits_el = document.getElementById("other-credits");
/**@type HTMLSelectElement */
let method_el = document.getElementById("filing-method");
/** @type HTMLSpanElement*/
let final_total_el = document.getElementById("final-total-income");
/**@type HTMLSpanElement*/
let final_deductions_el = document.getElementById("final-deduction");
/**@type HTMLSpanElement*/
let final_credits_el = document.getElementById("final-credits");
/**@type HTMLSpanElement*/
let taxable_income_el = document.getElementById("taxable-income");
/**@type HTMLInputElement */
let ytd_el = document.getElementById("paid-so-far");
/**@type HTMLInputElement */
let per_pay_el = document.getElementById("paying-per-period");
/**@type HTMLSelectElement */
let cadence_el = document.getElementById("period-cadence");
/**@type HTMLSpanElement */
let ytd_total_el = document.getElementById("paid-so-far-total");
/**@type HTMLSpanElement */
let per_pay_total_el = document.getElementById("paying-per-period-total");
/**@type HTMLSpanElement */
let periods_remaining_el = document.getElementById("pay-periods-remaining");
/**@type HTMLSpanElement */
let projected_el = document.getElementById("projected-to-pay");
/**@type HTMLSpanElement */
let expected_with_el = document.getElementById("expected-withholding");

register_input_el(income_el);
register_input_el(deductions_el);
register_input_el(credits_el);
register_input_el(per_pay_el);
register_input_el(ytd_el);
register_input_el(ytd_el);
register_input_el(cadence_el);

/**
 * 
 * @param {HTMLInputElement} el 
 */
function register_input_el(el) {
    el.addEventListener("change", update);
    let debounce;
    el.addEventListener("input", () => {
        if (debounce) {
            clearTimeout(debounce);
        }
        debounce = setTimeout(() => {
            debounce = null;
            update();
        }, 2);
    });
}

/**
 * 
 * @param {HTMLInputElement} el 
 * @returns number
 */
function element_value_as_number(el) {
    if (!el.value) return 0
    let value = el.value.replace("$", "").replace(",", "");
    try {
        return Number.parseFloat(value);
    } catch (err) {
        console.error("Error parsing input", err, el, el.value);
        return 0;
    }
}


function update() {
    let total_income = element_value_as_number(income_el);
    let total_deductions = element_value_as_number(deductions_el);
    let total_credits = element_value_as_number(credits_el);
    let filing_method = method_el.selectedOptions[0].value;
    let actual_deductions = calculate_deduction(total_deductions, filing_method);
    let taxable = calculate_taxable_income(
        total_income,
        filing_method,
        actual_deductions,
        total_credits
    );
    final_total_el.innerText = total_income.toLocaleString("en-us", {style: "currency", currency: "USD"});
    final_deductions_el.innerText = (-actual_deductions).toLocaleString("en-us", {style: "currency", currency: "USD"});
    final_credits_el.innerText = (total_credits > 0 ? -total_credits : 0).toLocaleString("en-us", {style: "currency", currency: "USD"});
    taxable_income_el.innerText = taxable.toLocaleString("en-us", {style: "currency", currency: "USD"});
}

update();
