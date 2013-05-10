// Copyright (C) 2013 Emmanuel Durand
//
// A few useful types

/*************/
function Property(value) {
    this.value = value;

    this.get = function () {
        return this.v;
    }

    this.set = function(value) {
        this.value = value;
    }
}