pragma circom 2.0.0;

/*
 * Dummy Factorization Circuit for PoC
 * 
 * This circuit proves knowledge of two private factors (a, b)
 * that multiply to produce a public output (c).
 * 
 * In the "Wizard of Oz" architecture, this serves as a 
 * "cryptographic receipt" that the Node.js backend verified 
 * the CGPA successfully.
 */

template Multiplier() {
    // Private inputs (known only to prover)
    signal input a;
    signal input b;
    
    // Public output (visible to anyone)
    signal output c;
    
    // Constraint: a * b must equal c
    c <== a * b;
}

component main = Multiplier();
