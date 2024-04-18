<template>
    <div class="container">
        <div class="construction">
            <img class="background-image" src="/under-construction.png">
            <h1 class="text">Under Construction</h1>
        </div>
    </div>
</template>
<style>
.container {
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.construction {
    position: relative;
    width: 100%;
    text-align: center;
}

.background-image {
    width: 100%;
    display: block;
}

.text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    text-transform: uppercase;
    font-family: verdana;
    font-size: 7em;
    font-weight: 700;
    color: #0b1523;
    text-shadow: 1px 1px 1px #c6cbd0,
        1px 2px 1px #c6cbd0,
        1px 3px 1px #c6cbd0,
        1px 4px 1px #c6cbd0,
        1px 5px 1px #c6cbd0,
        1px 6px 1px #c6cbd0,
        1px 7px 1px #c6cbd0,
        1px 8px 1px #c6cbd0,
        1px 9px 1px #c6cbd0,
        1px 10px 1px #c6cbd0,
    1px 18px 6px rgba(16,16,16,0.4),
    1px 22px 10px rgba(16,16,16,0.2),
    1px 25px 35px rgba(16,16,16,0.2),
    1px 30px 60px rgba(16,16,16,0.4);
}
</style>
