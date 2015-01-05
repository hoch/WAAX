start
  = body

body
  = p:item*

item
  = tag / buffer / reset

buffer "buffer"
  = e:eol w:ws*
  { return {"buffer": e + w.join('')} }
  / b:(!tag !reset c:any { return c })+
  { return {"buffer": b.join('')} }

tag
  = ld c:color ":" e:(!ld !rd c:any{return c})+ { return {color: c, text: e.join('')}}

any =
  esc_left
  / esc_right
  / a:. {return a}

esc_left
  = esc_seq out:"{" {return out}

esc_right
  = esc_seq out:"}" {return out}

esc_seq
  = "\\"

color
  = c:[a-zA-Z\.]+ { return c.join('') }

reset
  = r:(!esc_right rd) e:after? {return {reset: true, text: e ? e.join('') : '' }}

after
  = (!ld !rd after:any {return after})+

ld
  = "{"

rd
  = "}"

eol
  = "\n"        //line feed
  / "\r\n"      //carriage + line feed
  / "\r"        //carriage return
  / "\u2028"    //line separator
  / "\u2029"    //paragraph separator

ws
  = [\t\v\f \u00A0\uFEFF] / eol