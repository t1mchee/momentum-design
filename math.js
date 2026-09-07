// Math rendering for the three viewers. Formulas in the YAML are LaTeX: $$...$$ (or \[...\]) on a line
// of its own for a display formula, $...$ (or \(...\)) inline. When KaTeX has loaded, renderMath(el)
// typesets every formula inside el; when it has not (CDN down), the text is left exactly as written.
// A single $ opens inline math only when the next character is not a space or a digit, and closes only
// when the previous character is not a space and the next is not a digit, so "$100m of book" in prose
// is never read as math. Inline math does not span lines.
(function(){
  function findClose(s,from,close,inline){
    for(let j=from;j<s.length;j++){
      const c=s[j];
      if(s.startsWith(close,j)&&!(close==='$'&&s[j-1]==='\\')){
        if(close==='$'&&(/\s/.test(s[j-1])||/\d/.test(s[j+1]||''))) continue;
        return j;
      }
      if(c==='\\'){j++;continue;}
      if(inline&&c==='\n') return -1;
    }
    return -1;
  }
  // Split a string into {type:'text',data} and {type:'math',data,display,raw} parts.
  function splitMath(s){
    s=String(s??''); const out=[]; let i=0,last=0;
    while(i<s.length){
      let open=null,close=null,display=false;
      if(s.startsWith('$$',i)){open='$$';close='$$';display=true;}
      else if(s.startsWith('\\[',i)){open='\\[';close='\\]';display=true;}
      else if(s.startsWith('\\(',i)){open='\\(';close='\\)';}
      else if(s[i]==='$'&&s[i-1]!=='\\'&&/[^\s\d$]/.test(s[i+1]||'')){open='$';close='$';}
      if(!open){i++;continue;}
      const end=findClose(s,i+open.length,close,!display);
      if(end<0){i+=open.length;continue;}
      let before=s.slice(last,i);
      const tex=s.slice(i+open.length,end).trim(), raw=s.slice(i,end+close.length);
      let next=end+close.length;
      if(display){ // a display formula is a block: drop the line break and indent around it
        before=before.replace(/[ \t]*\n?[ \t]*$/,'');
        next+=(/^[ \t]*\n?/.exec(s.slice(next))||[''])[0].length;
      }
      if(before) out.push({type:'text',data:before});
      out.push({type:'math',data:tex,display,raw});
      last=i=next;
    }
    if(last<s.length) out.push({type:'text',data:s.slice(last)});
    return out;
  }
  // Typeset every formula in the text nodes under root. opts.inline renders display formulas inline
  // (for the small cards). No-op without KaTeX, which leaves the raw text in place.
  function renderMath(root,opts){
    opts=opts||{};
    if(!root||typeof katex==='undefined') return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null); const nodes=[]; let t;
    while((t=walker.nextNode())) nodes.push(t);
    nodes.forEach(node=>{
      const p=node.parentNode; if(!p||(p.closest&&p.closest('script,style,textarea,.katex'))) return;
      const v=node.nodeValue; if(v.indexOf('$')<0&&v.indexOf('\\')<0) return;
      const parts=splitMath(v); if(!parts.some(x=>x.type==='math')) return;
      // an opening bracket before, or punctuation after, an inline formula stays on its line
      for(let k=0;k<parts.length;k++){
        const x=parts[k]; if(x.type!=='math'||x.display) continue;
        const a=parts[k-1], b=parts[k+1];
        if(a&&a.type==='text'){ const m=/[(\[]$/.exec(a.data); if(m){ x.pre=m[0]; a.data=a.data.slice(0,-m[0].length); } }
        if(b&&b.type==='text'){ const m=/^[.,;:)\]'?!]+/.exec(b.data); if(m){ x.post=m[0]; b.data=b.data.slice(m[0].length); } }
      }
      const frag=document.createDocumentFragment();
      parts.forEach(x=>{
        if(x.type==='text'){ if(x.data) frag.appendChild(document.createTextNode(x.data)); return; }
        const display=x.display&&!opts.inline;
        const el=document.createElement(display?'div':'span'); el.className=display?'math-display':'math-inline';
        const k=display?el:document.createElement('span');
        try{ katex.render(x.data,k,{displayMode:display,throwOnError:false,strict:'ignore'}); }
        catch(e){ k.textContent=x.raw; }
        if(!display){ if(x.pre) el.appendChild(document.createTextNode(x.pre)); el.appendChild(k); if(x.post) el.appendChild(document.createTextNode(x.post)); }
        frag.appendChild(el);
      });
      p.replaceChild(frag,node);
    });
  }
  window.splitMath=splitMath; window.renderMath=renderMath;
})();
