const
    allAGit = document.querySelectorAll(".block a"),
    allDeg = [360, -360];
allAGit.forEach(e => {
    let last = 0;
    e.addEventListener('mouseenter', () => {
        const random = allDeg[last];
        last++;
        if (last == allDeg.length) last = 0;
        e.style.transform = `rotate(${random}deg)`
    });
    e.addEventListener('mouseleave', () => e.style = "")
})