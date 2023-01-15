document.getElementById('europe').addEventListener('mouseover', () => {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [8.90999637050685, 45.656723702070146],
        zoom: 3,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
document.getElementById('africa').addEventListener('mouseover', () => {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [18.435011, 8.729350],
        zoom: 3,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
document.getElementById('asia').addEventListener('mouseover', () => {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [75.908105, 34.323874],
        zoom: 3,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
document.getElementById('namerica').addEventListener('mouseover', () => {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [-99.445456, 39.215273],
        zoom: 3,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
document.getElementById('samerica').addEventListener('mouseover', () => {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [-59.692979, -8.355234],
        zoom: 3,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
// document.addEventListener('mouseout', function(e) {
//     if (!e.target.matches('#europe, #africa, #asia, #namerica, #samerica')) return;
//     map.flyTo({
//         center: [-19.253472, 22.738296],
//         zoom: 1,
//         essential: true
//     });
// });
document.addEventListener('mouseover', function(e) {
    if (!e.target.matches('#center')) return;
    map.flyTo({
        center: [-19.253472, 22.738296],
        zoom: 2,
        essential: true
    });
});