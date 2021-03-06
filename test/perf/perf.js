function assert(t) { if (!t) throw new Error("assertion failed"); }

// recursive fib //

function fib(n) {
    if (n < 2) return n;
    return fib(n-1) + fib(n-2);
}

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 1000; j++) {
        assert(fib(20) == 6765);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,fib," + tmin/1000);

// parse int //

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 1000*1000; j++) {
        var n = Math.floor(4294967295*Math.random());
        var s = n.toString(16);
        var m = parseInt(s,16);
        assert(m == n);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,parse_int," + tmin/1000);

// mandelbrot set //

function Complex(real, imag) {
    this.re = real;
    this.im = imag;
}
function complex_abs(z) {
    return Math.sqrt(z.re*z.re + z.im*z.im);
}
function complex_add(z,w) {
    return new Complex(z.re+w.re, z.im+w.im);
}
function complex_multiply(z,w) {
    return new Complex(z.re*w.re-z.im*w.im, z.re*w.im+z.im*w.re);
}

function mandel(z) {
    c = z;
    maxiter = 80;
    var n = 0;
    for (n = 0; n < maxiter; n++) {
        if (complex_abs(z) > 2) return n;
        z = complex_add(complex_multiply(z,z),c);
    }
    return maxiter;
}

function mandelperf() {
    var a = new Array(26*21);
    var r = 0;
    for (r = 0; r < 26; r++) {
        re = -2.0 + r*0.1;
        var i = 0;
        for (i = 0; i < 21; i++) {
            im = -1.0 + i*0.1;
            z = new Complex(re,im);
            a[r*21+i] = mandel(z);
        }
    }
    return a;
}

a = mandelperf();
i = 0;
sum = 0;
for (i = 0; i < a.length; i++) sum += a[i];
assert(sum == 14791);
a0 = a[0];

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 1000; j++) {
        a = mandelperf();
        assert(a[0] == a0);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,mandel," + tmin/1000);

// numeric vector sort //

function rand(n) {
    var v = new Array(n);
    var i = 0;
    for (i = 0; i < n; i++)
        v[i] = Math.random();
    return v;
}

function sortperf(n) {
    var v = rand(n);
    v.sort(function(a,b) { return a-b; });
    return v;
}

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 100; j++) {
        v = sortperf(5000);
        assert(a[0] < 0.99);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,quicksort," + tmin/100);

// slow pi series //

function pisum() {
    var sum = 0.0;
    for (var i=0; i < 500; i++) {
        sum = 0.0;
        for (var k=1; k <= 10000; k++)
            sum += 1.0/(k*k);
    }
    return sum;
}

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 10; j++) {
        assert(Math.abs(pisum()-1.644834071848065) < 1e-12);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,pi_sum," + tmin/10);

// random matrix statistics //

function randn( a, sub ) {
    var subLen = sub.length,
        len = a.length;
    
    for (var i = 0; i < subLen; i++) {
        a[i] = sub[i] = gaussian();
    }
    
    for (var i = subLen; i < len; i++) {
        a[i] = gaussian();
    }
    
    return a;
}

function gaussian() {
    var k = 2;
    do {
        var i = 2*Math.random()-1;
        var j = 2*Math.random()-1;
        k = i*i+j*j;
    } while (k >= 1);
    return i*Math.sqrt((-2*Math.log(k))/k);
}

function transpose(dest, src,m,n) {
    var i = 0;
    var j = 0;
    
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            dest[i*n+j] = src[j*m+i];
        }
    }
}

function matmulCopy( dest, A,B,m,l,n) {
    var i = 0;
    var j = 0;
    var k = 0;
    
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            var sum = 0.0;
            
            for (k = 0; k < l; k++) {
                sum += A[i*l+k]*B[k*n+j];
            }
            
            dest[i*n+j] = sum;
        }
    }
}

function randmatstat(t) {
    var n = 5;
    
    var P = new Float64Array( 4*n*n ),
        Q = new Float64Array( 4*n*n );
        
    var PTransposed = new Float64Array( P.length ),
        QTransposed = new Float64Array( Q.length );
    
    var PMatMul = new Float64Array( n*n ),
        QMatMul = new Float64Array( (2*n) * (2*n) );
    
    var a = new Float64Array( n*n ),
        b = new Float64Array( n*n ),
        c = new Float64Array( n*n ),
        d = new Float64Array( n*n );
    
    // the first n number of elements of a to d
    var aSub = new Float64Array( n ),
        bSub = new Float64Array( n ),
        cSub = new Float64Array( n ),
        dSub = new Float64Array( n );
    
    var v = new Float64Array( t ),
        w = new Float64Array( t );
    
    var i = 0,
        j = 0,
        k = 0;
    
    for (i = 0; i < t; i++) {
        a = randn( a, aSub );
        b = randn( b, bSub );
        c = randn( c, cSub );
        d = randn( d, dSub );
        
        P.set( a, 0*n*n );
        P.set( b, 1*n*n );
        P.set( c, 2*n*n );
        P.set( d, 3*n*n );
        
        for (j = 0; j < n; j++) {
            Q.set( aSub, 2*n*j         );
            Q.set( bSub, 2*n*j+n       );
            Q.set( cSub, 2*n*(n+j)     );
            Q.set( dSub, 2*n*(n+j)+n   );
/*
            for (k = 0; k < n; k++) {
                Q[ 2*n*j        + k ] = a[k];
                Q[ 2*n*j+n      + k ] = b[k];
                Q[ 2*n*(n+j)    + k ] = c[k];
                Q[ 2*n*(n+j)+n  + k ] = d[k];
            }
*/
        }
        
        transpose( PTransposed, P, n, 4*n );
        matmulCopy( PMatMul, PTransposed, P, n, 4*n, n );
        matmulCopy( PMatMul, P, P, n, n, n);
        matmulCopy( PMatMul, P, P, n, n, n);
        
        var trP = 0;
        for (j = 0; j < n; j++) {
            trP += PMatMul[(n+1)*j];
        }
        v[i] = trP;
        
        transpose( QTransposed, Q, 2*n, 2*n );
        matmulCopy( QMatMul, QTransposed, Q, 2*n, 2*n, 2*n );
        matmulCopy( QMatMul, Q, Q, 2*n, 2*n, 2*n);
        matmulCopy( QMatMul, Q, Q, 2*n, 2*n, 2*n);
        
        var trQ = 0;
        for (j = 0; j < 2*n; j++) {
            trQ += QMatMul[(2*n+1)*j];
        }
        w[i] = trQ;
    }
    
    var v1 = 0.0;
    var v2 = 0.0;
    var w1 = 0.0;
    var w2 = 0.0;
    for (i = 0; i < t; i++) {
        v1 += v[i]; v2 += v[i]*v[i];
        w1 += w[i]; w2 += w[i]*w[i];
    }
    
    return {
            s1: Math.sqrt((t*(t*v2-v1*v1))/((t-1)*v1*v1)),
            s2: Math.sqrt((t*(t*w2-w1*w1))/((t-1)*w1*w1))
    };
}

tmin = Number.POSITIVE_INFINITY;
for (var i=0; i < 5; i++) {
    t = (new Date).getTime();
    for (var j=0; j < 10; j++) {
        var r = randmatstat(1000);
        // assert(0.5 < r.s1 < 1.0);
//        assert(0.5 < r.s2 < 1.0);
    }
    t = (new Date).getTime()-t;
    if (t < tmin) tmin = t;
}
console.log("javascript,rand_mat_stat," + tmin/10);

// random matrix multiply //

function matmul(A,B,m,l,n) {
    var C = new Array(m*n);
    var i = 0;
    var j = 0;
    var k = 0;
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            C[i*n+j] = 0.0;
            for (k = 0; k < l; k++) {
                C[i*n+j] += A[i*l+k]*B[k*n+j];
            }
        }
    }
    return C;
}

function randmatmul(n) {
    var A = rand(n*n);
    var B = rand(n*n);
    return matmul(A, B, n, n, n);
}

tmin = Number.POSITIVE_INFINITY;
t = (new Date).getTime();
var C = randmatmul(1000);
assert(0 <= C[0]);
t = (new Date).getTime()-t;
if (t < tmin) tmin = t;
console.log("javascript,rand_mat_mul," + tmin);
