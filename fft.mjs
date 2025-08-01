export { FFTJS };

var FFTJS = (function(t) {
  function r(e) {
    if (i[e]) return i[e].exports;
    var o = (i[e] = { i: e, l: !1, exports: {} });
    return t[e].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
  }
  var i = {};
  return (
    (r.m = t),
    (r.c = i),
    (r.i = function(t) {
      return t;
    }),
    (r.d = function(t, i, e) {
      r.o(t, i) ||
        Object.defineProperty(t, i, {
          configurable: !1,
          enumerable: !0,
          get: e
        });
    }),
    (r.n = function(t) {
      var i =
        t && t.__esModule
          ? function() {
              return t.default;
            }
          : function() {
              return t;
            };
      return r.d(i, "a", i), i;
    }),
    (r.o = function(t, r) {
      return Object.prototype.hasOwnProperty.call(t, r);
    }),
    (r.p = ""),
    r((r.s = 0))
  );
})([
  function(t, r, i) {
    "use strict";
    function e(t) {
      if (
        ((this.size = 0 | t),
        this.size <= 1 || 0 != (this.size & (this.size - 1)))
      )
        throw new Error("FFT size must be a power of two and bigger than 1");
      this._csize = t << 1;
      for (var r = new Array(2 * this.size), i = 0; i < r.length; i += 2) {
        var e = (Math.PI * i) / this.size;
        (r[i] = Math.cos(e)), (r[i + 1] = -Math.sin(e));
      }
      this.table = r;
      for (var o = 0, n = 1; this.size > n; n <<= 1) o++;
      (this._width = o % 2 == 0 ? o - 1 : o),
        (this._bitrev = new Array(1 << this._width));
      for (var s = 0; s < this._bitrev.length; s++) {
        this._bitrev[s] = 0;
        for (var a = 0; a < this._width; a += 2) {
          var h = this._width - a - 2;
          this._bitrev[s] |= ((s >>> a) & 3) << h;
        }
      }
      (this._out = null), (this._data = null), (this._inv = 0);
    }
    (t.exports = e),
      (e.prototype.fromComplexArray = function(t, r) {
        for (
          var i = r || new Array(t.length >>> 1), e = 0;
          e < t.length;
          e += 2
        )
          i[e >>> 1] = t[e];
        return i;
      }),
      (e.prototype.createComplexArray = function() {
        for (var t = new Array(this._csize), r = 0; r < t.length; r++) t[r] = 0;
        return t;
      }),
      (e.prototype.toComplexArray = function(t, r) {
        for (
          var i = r || this.createComplexArray(), e = 0;
          e < i.length;
          e += 2
        )
          (i[e] = t[e >>> 1]), (i[e + 1] = 0);
        return i;
      }),
      (e.prototype.completeSpectrum = function(t) {
        for (var r = this._csize, i = r >>> 1, e = 2; e < i; e += 2)
          (t[r - e] = t[e]), (t[r - e + 1] = -t[e + 1]);
      }),
      (e.prototype.transform = function(t, r) {
        if (t === r)
          throw new Error("Input and output buffers must be different");
        (this._out = t),
          (this._data = r),
          (this._inv = 0),
          this._transform4(),
          (this._out = null),
          (this._data = null);
      }),
      (e.prototype.realTransform = function(t, r) {
        if (t === r)
          throw new Error("Input and output buffers must be different");
        (this._out = t),
          (this._data = r),
          (this._inv = 0),
          this._realTransform4(),
          (this._out = null),
          (this._data = null);
      }),
      (e.prototype.inverseTransform = function(t, r) {
        if (t === r)
          throw new Error("Input and output buffers must be different");
        (this._out = t), (this._data = r), (this._inv = 1), this._transform4();
        for (var i = 0; i < t.length; i++) t[i] /= this.size;
        (this._out = null), (this._data = null);
      }),
      (e.prototype._transform4 = function() {
        var t,
          r,
          i = this._out,
          e = this._csize,
          o = this._width,
          n = 1 << o,
          s = (e / n) << 1,
          a = this._bitrev;
        if (4 === s)
          for (t = 0, r = 0; t < e; t += s, r++) {
            var h = a[r];
            this._singleTransform2(t, h, n);
          }
        else
          for (t = 0, r = 0; t < e; t += s, r++) {
            var f = a[r];
            this._singleTransform4(t, f, n);
          }
        var u = this._inv ? -1 : 1,
          _ = this.table;
        for (n >>= 2; n >= 2; n >>= 2) {
          s = (e / n) << 1;
          var l = s >>> 2;
          for (t = 0; t < e; t += s)
            for (var p = t + l, v = t, c = 0; v < p; v += 2, c += n) {
              var d = v,
                m = d + l,
                y = m + l,
                b = y + l,
                w = i[d],
                g = i[d + 1],
                z = i[m],
                T = i[m + 1],
                x = i[y],
                A = i[y + 1],
                C = i[b],
                E = i[b + 1],
                F = w,
                I = g,
                M = _[c],
                R = u * _[c + 1],
                O = z * M - T * R,
                P = z * R + T * M,
                j = _[2 * c],
                S = u * _[2 * c + 1],
                J = x * j - A * S,
                k = x * S + A * j,
                q = _[3 * c],
                B = u * _[3 * c + 1],
                D = C * q - E * B,
                G = C * B + E * q,
                H = F + J,
                K = I + k,
                L = F - J,
                N = I - k,
                Q = O + D,
                U = P + G,
                V = u * (O - D),
                W = u * (P - G),
                X = H + Q,
                Y = K + U,
                Z = H - Q,
                $ = K - U,
                tt = L + W,
                rt = N - V,
                it = L - W,
                et = N + V;
              (i[d] = X),
                (i[d + 1] = Y),
                (i[m] = tt),
                (i[m + 1] = rt),
                (i[y] = Z),
                (i[y + 1] = $),
                (i[b] = it),
                (i[b + 1] = et);
            }
        }
      }),
      (e.prototype._singleTransform2 = function(t, r, i) {
        var e = this._out,
          o = this._data,
          n = o[r],
          s = o[r + 1],
          a = o[r + i],
          h = o[r + i + 1],
          f = n + a,
          u = s + h,
          _ = n - a,
          l = s - h;
        (e[t] = f), (e[t + 1] = u), (e[t + 2] = _), (e[t + 3] = l);
      }),
      (e.prototype._singleTransform4 = function(t, r, i) {
        var e = this._out,
          o = this._data,
          n = this._inv ? -1 : 1,
          s = 2 * i,
          a = 3 * i,
          h = o[r],
          f = o[r + 1],
          u = o[r + i],
          _ = o[r + i + 1],
          l = o[r + s],
          p = o[r + s + 1],
          v = o[r + a],
          c = o[r + a + 1],
          d = h + l,
          m = f + p,
          y = h - l,
          b = f - p,
          w = u + v,
          g = _ + c,
          z = n * (u - v),
          T = n * (_ - c),
          x = d + w,
          A = m + g,
          C = y + T,
          E = b - z,
          F = d - w,
          I = m - g,
          M = y - T,
          R = b + z;
        (e[t] = x),
          (e[t + 1] = A),
          (e[t + 2] = C),
          (e[t + 3] = E),
          (e[t + 4] = F),
          (e[t + 5] = I),
          (e[t + 6] = M),
          (e[t + 7] = R);
      }),
      (e.prototype._realTransform4 = function() {
        var t,
          r,
          i = this._out,
          e = this._csize,
          o = this._width,
          n = 1 << o,
          s = (e / n) << 1,
          a = this._bitrev;
        if (4 === s)
          for (t = 0, r = 0; t < e; t += s, r++) {
            var h = a[r];
            this._singleRealTransform2(t, h >>> 1, n >>> 1);
          }
        else
          for (t = 0, r = 0; t < e; t += s, r++) {
            var f = a[r];
            this._singleRealTransform4(t, f >>> 1, n >>> 1);
          }
        var u = this._inv ? -1 : 1,
          _ = this.table;
        for (n >>= 2; n >= 2; n >>= 2) {
          s = (e / n) << 1;
          var l = s >>> 1,
            p = l >>> 1,
            v = p >>> 1;
          for (t = 0; t < e; t += s)
            for (var c = 0, d = 0; c <= v; c += 2, d += n) {
              var m = t + c,
                y = m + p,
                b = y + p,
                w = b + p,
                g = i[m],
                z = i[m + 1],
                T = i[y],
                x = i[y + 1],
                A = i[b],
                C = i[b + 1],
                E = i[w],
                F = i[w + 1],
                I = g,
                M = z,
                R = _[d],
                O = u * _[d + 1],
                P = T * R - x * O,
                j = T * O + x * R,
                S = _[2 * d],
                J = u * _[2 * d + 1],
                k = A * S - C * J,
                q = A * J + C * S,
                B = _[3 * d],
                D = u * _[3 * d + 1],
                G = E * B - F * D,
                H = E * D + F * B,
                K = I + k,
                L = M + q,
                N = I - k,
                Q = M - q,
                U = P + G,
                V = j + H,
                W = u * (P - G),
                X = u * (j - H),
                Y = K + U,
                Z = L + V,
                $ = N + X,
                tt = Q - W;
              if (
                ((i[m] = Y),
                (i[m + 1] = Z),
                (i[y] = $),
                (i[y + 1] = tt),
                0 !== c)
              ) {
                if (c !== v) {
                  var rt = N,
                    it = -Q,
                    et = K,
                    ot = -L,
                    nt = -u * X,
                    st = -u * W,
                    at = -u * V,
                    ht = -u * U,
                    ft = rt + nt,
                    ut = it + st,
                    _t = et + ht,
                    lt = ot - at,
                    pt = t + p - c,
                    vt = t + l - c;
                  (i[pt] = ft),
                    (i[pt + 1] = ut),
                    (i[vt] = _t),
                    (i[vt + 1] = lt);
                }
              } else {
                var ct = K - U,
                  dt = L - V;
                (i[b] = ct), (i[b + 1] = dt);
              }
            }
        }
      }),
      (e.prototype._singleRealTransform2 = function(t, r, i) {
        var e = this._out,
          o = this._data,
          n = o[r],
          s = o[r + i],
          a = n + s,
          h = n - s;
        (e[t] = a), (e[t + 1] = 0), (e[t + 2] = h), (e[t + 3] = 0);
      }),
      (e.prototype._singleRealTransform4 = function(t, r, i) {
        var e = this._out,
          o = this._data,
          n = this._inv ? -1 : 1,
          s = 2 * i,
          a = 3 * i,
          h = o[r],
          f = o[r + i],
          u = o[r + s],
          _ = o[r + a],
          l = h + u,
          p = h - u,
          v = f + _,
          c = n * (f - _),
          d = l + v,
          m = p,
          y = -c,
          b = l - v,
          w = p,
          g = c;
        (e[t] = d),
          (e[t + 1] = 0),
          (e[t + 2] = m),
          (e[t + 3] = y),
          (e[t + 4] = b),
          (e[t + 5] = 0),
          (e[t + 6] = w),
          (e[t + 7] = g);
      });
  }
]);
